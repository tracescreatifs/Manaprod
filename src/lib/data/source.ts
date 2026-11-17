import "server-only";
import { cacheLife } from "next/cache";
import { getSupabaseEnv, isBuildPhase, isVercel, readSupabaseEnv } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

let warned = false;

/**
 * Client des lectures publiques mises en cache (décisions D43 et D47).
 *
 * - Variables Supabase présentes : client sans session.
 * - Variables absentes pendant un build hors de Vercel (intégration continue,
 *   build local) : avertissement dans les logs et null ; les pages sont
 *   prérendues sans les blocs qui dépendent de la base.
 * - Variables absentes sur Vercel (build ou exécution) ou à l'exécution
 *   ailleurs : erreur claire, le build Vercel échoue au lieu de déployer un
 *   site sans données.
 */
export function publicDataClient() {
  const env = readSupabaseEnv();
  if (env) return createPublicClient(env);

  if (isBuildPhase() && !isVercel()) {
    if (!warned) {
      warned = true;
      console.warn(
        "[MANA PROD] Variables Supabase absentes pendant le build (hors Vercel) : pages prérendues sans les données de la base.",
      );
    }
    return null;
  }

  // Lève l'erreur explicite : nom de la variable et où la saisir.
  getSupabaseEnv();
  return null;
}

/** Résultat d'une lecture mise en cache : données, ou message d'erreur. */
export type Loaded<T> = { ok: true; data: T } | { ok: false; message: string };

/**
 * Lecture dans une fonction "use cache" (décision D69). Une erreur levée à
 * l'intérieur d'une fonction mise en cache bloque la réponse au visiteur :
 * l'erreur est donc capturée et renvoyée comme résultat, mise en cache
 * quelques secondes seulement (cacheLife « seconds »), puis relevée hors du
 * cache par unwrap(). Une lecture réussie est mise en cache longtemps
 * (cacheLife « max »), et invalidée par étiquette depuis le dashboard.
 * À appeler uniquement depuis une fonction "use cache".
 */
export async function cachedRead<T>(what: string, read: () => Promise<T>): Promise<Loaded<T>> {
  try {
    const data = await read();
    cacheLife("max");
    return { ok: true, data };
  } catch (error) {
    cacheLife("seconds");
    return { ok: false, message: `Lecture ${what} impossible : ${(error as Error).message}` };
  }
}

/** Données d'une lecture, ou erreur claire levée hors du cache (jamais avalée). */
export function unwrap<T>(result: Loaded<T>): T {
  if (!result.ok) throw new Error(result.message);
  return result.data;
}

/** Erreur renvoyée par Supabase, à lever dans la fonction passée à cachedRead. */
export function supabaseError(message: string): Error {
  return new Error(`Supabase : ${message}`);
}
