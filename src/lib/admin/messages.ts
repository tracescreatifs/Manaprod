import "server-only";
import { requireAdmin } from "@/lib/admin/auth";
import type { Tables } from "@/types/database";

// Lectures de l'onglet Messages (cahier 7.6) : client à cookies (RLS :
// administrateurs uniquement), jamais mises en cache.

export const MESSAGES_PER_PAGE = 30;

export type MessageFilter = "tous" | "a-traiter" | "traites";
export type ContactMessage = Tables<"contact_messages">;

export function parseFilter(value: unknown): MessageFilter {
  return value === "a-traiter" || value === "traites" ? value : "tous";
}

export function parsePage(value: unknown): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function getMessages(
  filter: MessageFilter,
  page: number,
): Promise<{ messages: ContactMessage[]; total: number }> {
  const { supabase } = await requireAdmin();
  const from = (page - 1) * MESSAGES_PER_PAGE;
  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + MESSAGES_PER_PAGE - 1);
  if (filter === "a-traiter") query = query.eq("handled", false);
  if (filter === "traites") query = query.eq("handled", true);
  const { data, error, count } = await query;
  if (error) throw new Error(`[MANA PROD] Dashboard : lecture des messages impossible (${error.message}).`);
  return { messages: data, total: count ?? data.length };
}

/** Nombre de messages à traiter (navigation du dashboard). */
export async function countUnhandledMessages(): Promise<number> {
  const { supabase } = await requireAdmin();
  const { count, error } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("handled", false);
  if (error) {
    console.error(`[MANA PROD] Dashboard : comptage des messages impossible (${error.message}).`);
    return 0;
  }
  return count ?? 0;
}
