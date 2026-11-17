import "server-only";
import type { AdminClient } from "@/app/admin/client-actions";
import type { AdminMember } from "@/app/admin/team-actions";
import { requireAdmin } from "@/lib/admin/auth";

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
