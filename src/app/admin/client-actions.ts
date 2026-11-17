"use server";

import { updateTag } from "next/cache";
import { z } from "@/lib/zod";
import { failure, success, type ActionState } from "@/lib/admin/action-state";
import { requireAdmin } from "@/lib/admin/auth";
import { isClientLogoPath } from "@/lib/admin/images";
import { clientSchema, orderSchema, validate } from "@/lib/admin/schemas";
import { listMediaFiles, removeMediaFiles } from "@/lib/admin/storage";
import { CACHE_TAGS } from "@/lib/data/tags";
import type { Tables } from "@/types/database";

// Server Actions de l'onglet Clients (cahier 7.3) : requireAdmin(), zod,
// client à cookies (RLS is_admin). Après chaque écriture réussie, le
// bandeau de l'accueil est invalidé (updateTag clients).

export type AdminClient = Pick<Tables<"clients">, "id" | "name" | "logo_path" | "logo_white">;

const SAVE_FAILED = "L’enregistrement a échoué. Réessayez dans un instant.";
const NOT_FOUND = "Ce client n’existe plus. Rechargez la page.";
const id = z.uuid();

function publish() {
  updateTag(CACHE_TAGS.clients);
}

function logError(context: string, message: string) {
  console.error(`[MANA PROD] Dashboard clients : ${context} (${message}).`);
}

export async function addClient(input: unknown): Promise<ActionState & { client?: AdminClient }> {
  const { supabase } = await requireAdmin();
  const parsed = validate(clientSchema, input);
  if (!parsed.ok) return failure("Certains champs sont à corriger.", parsed.errors);

  const { data: last } = await supabase.from("clients").select("position").order("position", { ascending: false }).limit(1);
  const { data, error } = await supabase
    .from("clients")
    .insert({ name: parsed.data.name, position: (last?.[0]?.position ?? -1) + 1 })
    .select("id, name, logo_path, logo_white")
    .single();
  if (error) {
    logError("ajout impossible", error.message);
    return failure(SAVE_FAILED);
  }
  publish();
  return { ...success("Client ajouté. Il apparaît dans le bandeau de l’accueil."), client: data };
}

export async function renameClient(clientId: unknown, input: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const cid = id.safeParse(clientId);
  if (!cid.success) return failure(NOT_FOUND);
  const parsed = validate(clientSchema, input);
  if (!parsed.ok) return failure("Certains champs sont à corriger.", parsed.errors);
  const { data, error } = await supabase.from("clients").update({ name: parsed.data.name }).eq("id", cid.data).select("id");
  if (error || data.length === 0) {
    if (error) logError("enregistrement impossible", error.message);
    return failure(error ? SAVE_FAILED : NOT_FOUND);
  }
  publish();
  return success("Nom enregistré.");
}

export async function setClientWhite(clientId: unknown, white: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const cid = id.safeParse(clientId);
  if (!cid.success || typeof white !== "boolean") return failure(SAVE_FAILED);
  const { data, error } = await supabase.from("clients").update({ logo_white: white }).eq("id", cid.data).select("id");
  if (error || data.length === 0) {
    if (error) logError("enregistrement impossible", error.message);
    return failure(error ? SAVE_FAILED : NOT_FOUND);
  }
  publish();
  return success(white ? "Logo affiché en blanc." : "Logo affiché en gris, en couleur au survol.");
}

export async function reorderClients(ids: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = orderSchema.safeParse(ids);
  if (!parsed.success) return failure(SAVE_FAILED);
  const results = await Promise.all(
    parsed.data.map((clientId, position) => supabase.from("clients").update({ position }).eq("id", clientId).select("id")),
  );
  publish();
  const failed = results.find((r) => r.error || r.data?.length === 0);
  if (failed) {
    if (failed.error) logError("enregistrement de l'ordre impossible", failed.error.message);
    return failure("L’ordre n’a pas pu être enregistré entièrement. Rechargez la page et réessayez.");
  }
  return success("Ordre enregistré. Il est appliqué sur le bandeau.");
}

async function currentLogo(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], clientId: string) {
  const { data } = await supabase.from("clients").select("logo_path").eq("id", clientId).maybeSingle();
  return data;
}

/** Enregistre un logo déjà téléversé ; l'ancien fichier est supprimé, le nouveau aussi en cas d'échec. */
export async function setClientLogo(clientId: unknown, path: unknown): Promise<ActionState & { path?: string }> {
  const { supabase } = await requireAdmin();
  const cid = id.safeParse(clientId);
  if (!cid.success || typeof path !== "string" || !isClientLogoPath(cid.data, path)) return failure(SAVE_FAILED);
  const client = await currentLogo(supabase, cid.data);
  if (!client) {
    await removeMediaFiles(supabase, [path]);
    return failure(NOT_FOUND);
  }
  const { data, error } = await supabase.from("clients").update({ logo_path: path }).eq("id", cid.data).select("id");
  if (error || data.length === 0) {
    if (error) logError("enregistrement du logo impossible", error.message);
    await removeMediaFiles(supabase, [path]);
    return failure("Le logo n’a pas pu être enregistré. Réessayez.");
  }
  if (client.logo_path !== path) await removeMediaFiles(supabase, [client.logo_path]);
  publish();
  return { ...success("Logo enregistré. Il est en ligne sur l’accueil."), path };
}

export async function removeClientLogo(clientId: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const cid = id.safeParse(clientId);
  if (!cid.success) return failure(SAVE_FAILED);
  const client = await currentLogo(supabase, cid.data);
  if (!client) return failure(NOT_FOUND);
  const { data, error } = await supabase.from("clients").update({ logo_path: null }).eq("id", cid.data).select("id");
  if (error || data.length === 0) {
    if (error) logError("retrait du logo impossible", error.message);
    return failure("Le logo n’a pas pu être retiré. Réessayez.");
  }
  await removeMediaFiles(supabase, [client.logo_path]);
  publish();
  return success("Logo retiré. Le nom du client s’affiche en texte.");
}

export async function deleteClient(clientId: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const cid = id.safeParse(clientId);
  if (!cid.success) return failure(NOT_FOUND);
  const { data, error } = await supabase.from("clients").delete().eq("id", cid.data).select("logo_path");
  if (error || data.length === 0) {
    if (error) logError("suppression impossible", error.message);
    return failure(error ? "La suppression a échoué. Réessayez dans un instant." : NOT_FOUND);
  }
  const strays = await listMediaFiles(supabase, "clients", `${cid.data}-`);
  await removeMediaFiles(supabase, [data[0].logo_path, ...strays]);
  publish();
  return success("Client supprimé, avec son logo.");
}

/** Supprime un logo téléversé dont l'enregistrement n'a pas abouti (jamais un logo en place). */
export async function discardClientUpload(clientId: unknown, path: unknown): Promise<void> {
  const { supabase } = await requireAdmin();
  const cid = id.safeParse(clientId);
  if (!cid.success || typeof path !== "string" || !isClientLogoPath(cid.data, path)) return;
  const client = await currentLogo(supabase, cid.data);
  if (client?.logo_path === path) return;
  await removeMediaFiles(supabase, [path]);
}
