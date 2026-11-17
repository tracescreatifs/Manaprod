import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabaseEnv, isBuildPhase, readSupabaseEnv } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS } from "@/lib/data/tags";
import { telHref } from "@/lib/phone";
import type { Tables } from "@/types/database";

export type SiteSettings = Tables<"site_settings">;

/**
 * Réglages du site (ligne unique de site_settings), mis en cache.
 * Renvoie null si la ligne n'existe pas.
 *
 * Variables Supabase absentes (décision D43) :
 * - pendant le build : avertissement dans les logs et null, la page est
 *   prérendue sans les blocs qui dépendent de la base ;
 * - à l'exécution : erreur claire, jamais masquée.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("max");

  // Hors build, getSupabaseEnv() lève l'erreur explicite sur la variable manquante.
  const env = readSupabaseEnv() ?? (isBuildPhase() ? null : getSupabaseEnv());
  if (!env) {
    console.warn(
      "[MANA PROD] Variables Supabase absentes pendant le build : pages prérendues sans les réglages de la base. En production, saisissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans Vercel puis redéployez.",
    );
    return null;
  }

  const supabase = createPublicClient(env);
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(`Lecture des réglages du site impossible (Supabase) : ${error.message}`);
  }
  return data;
}

export type SiteContact = {
  phone: string | null;
  phoneHref: string | null;
  email: string | null;
  city: string | null;
};

const filled = (value: string | null | undefined) => value?.trim() || null;

/** Coordonnées prêtes à afficher : une valeur vide en base devient null (bloc masqué). */
export function siteContact(settings: SiteSettings | null): SiteContact {
  const phone = filled(settings?.phone);
  return {
    phone,
    phoneHref: phone ? telHref(phone) : null,
    email: filled(settings?.email),
    city: filled(settings?.city),
  };
}
