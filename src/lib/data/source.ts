import "server-only";
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

/** Erreur Supabase transformée en message clair, jamais avalée. */
export function dataError(what: string, message: string): Error {
  return new Error(`Lecture ${what} impossible (Supabase) : ${message}`);
}
