import "server-only";
import type { AdminClient } from "@/app/admin/client-actions";
import type { AdminMember } from "@/app/admin/team-actions";
import type { SavedBackstagePhoto } from "@/app/admin/studio-actions";
import { requireAdmin } from "@/lib/admin/auth";
import { isMissingTable } from "@/lib/data/backstage";

// Lectures des onglets Clients et Équipe : client à cookies, jamais mises en cache.

export async function getAdminClients(): Promise<AdminClient[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, logo_path, logo_white")
    .order("position", { ascending: true });
  if (error) throw new Error(`[MANA PROD] Dashboard : lecture des clients impossible (${error.message}).`);
  return data;
}

export async function getAdminTeam(): Promise<AdminMember[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("team_members")
    .select("id, name, role, bio, photo_path")
    .order("position", { ascending: true });
  if (error) throw new Error(`[MANA PROD] Dashboard : lecture de l'équipe impossible (${error.message}).`);
  return data;
}

/** Photos des coulisses ; `missing` si la migration 0004 n'est pas exécutée. */
export async function getAdminBackstage(): Promise<{ photos: SavedBackstagePhoto[]; missing: boolean }> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("backstage_photos")
    .select("id, storage_path, alt, width, height")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return { photos: [], missing: true };
    throw new Error(`[MANA PROD] Dashboard : lecture des coulisses impossible (${error.message}).`);
  }
  return { photos: data, missing: false };
}
