import "server-only";
import { requireAdmin } from "@/lib/admin/auth";
import type { Tables } from "@/types/database";

/**
 * Réglages lus par le dashboard : client à cookies (session administrateur),
 * jamais mis en cache, pour toujours afficher la valeur enregistrée.
 */
export async function getAdminSettings(): Promise<Tables<"site_settings">> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`[MANA PROD] Dashboard : lecture des réglages impossible (${error.message}).`);
  if (!data) throw new Error("[MANA PROD] Dashboard : la ligne site_settings (id 1) est absente. Exécutez le seed.");
  return data;
}
