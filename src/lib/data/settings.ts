import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { dataError, publicDataClient } from "@/lib/data/source";
import { CACHE_TAGS } from "@/lib/data/tags";
import { telHref } from "@/lib/phone";
import type { Tables } from "@/types/database";

export type SiteSettings = Tables<"site_settings">;

/**
 * Réglages du site (ligne unique de site_settings), mis en cache.
 * Renvoie null si la ligne n'existe pas, ou pendant un build hors de Vercel
 * sans variables Supabase (voir publicDataClient).
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("max");

  const supabase = publicDataClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw dataError("des réglages du site", error.message);
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
