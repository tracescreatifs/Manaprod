"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { failure, success, type ActionState } from "@/lib/admin/action-state";
import { requireAdmin } from "@/lib/admin/auth";

// Server Actions de l'onglet Messages (cahier 7.6) : client à cookies, RLS
// réservée aux administrateurs. refresh() met à jour la liste et le nombre
// de messages à traiter affiché dans la navigation. Aucun contenu de
// message dans les logs.

const id = z.uuid();
const FAILED = "L’action a échoué. Réessayez dans un instant.";

export async function setMessageHandled(messageId: unknown, handled: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const mid = id.safeParse(messageId);
  if (!mid.success || typeof handled !== "boolean") return failure(FAILED);
  const { data, error } = await supabase.from("contact_messages").update({ handled }).eq("id", mid.data).select("id");
  if (error || data.length === 0) {
    if (error) console.error(`[MANA PROD] Dashboard messages : mise à jour impossible (${error.message}).`);
    return failure(FAILED);
  }
  refresh();
  return success(handled ? "Message marqué comme traité." : "Message remis à traiter.");
}

export async function deleteMessage(messageId: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const mid = id.safeParse(messageId);
  if (!mid.success) return failure(FAILED);
  const { data, error } = await supabase.from("contact_messages").delete().eq("id", mid.data).select("id");
  if (error || data.length === 0) {
    if (error) console.error(`[MANA PROD] Dashboard messages : suppression impossible (${error.message}).`);
    return failure("La suppression a échoué. Réessayez dans un instant.");
  }
  refresh();
  return success("Message supprimé.");
}
