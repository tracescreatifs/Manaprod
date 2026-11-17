"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { failure, success, type ActionState } from "@/lib/admin/action-state";
import { requireAdmin } from "@/lib/admin/auth";
import { isTeamPhotoPath } from "@/lib/admin/images";
import { orderSchema, teamMemberSchema, validate } from "@/lib/admin/schemas";
import { listMediaFiles, removeMediaFiles } from "@/lib/admin/storage";
import { CACHE_TAGS } from "@/lib/data/tags";
import type { Tables } from "@/types/database";

// Server Actions de l'onglet Équipe (cahier 7.4) : requireAdmin(), zod,
// client à cookies (RLS is_admin). Après chaque écriture réussie, la page
// Le studio est invalidée (updateTag team). Les photos de départ (chemins
// « /team/... » du dossier public, D06) ne sont jamais supprimées du bucket.

export type AdminMember = Pick<Tables<"team_members">, "id" | "name" | "role" | "bio" | "photo_path">;

const FIX_FIELDS = "Certains champs sont à corriger.";
const SAVE_FAILED = "L’enregistrement a échoué. Réessayez dans un instant.";
const NOT_FOUND = "Ce membre n’existe plus. Rechargez la page.";
const id = z.uuid();

function publish() {
  updateTag(CACHE_TAGS.team);
}

function logError(context: string, message: string) {
  console.error(`[MANA PROD] Dashboard équipe : ${context} (${message}).`);
}

export async function addMember(input: unknown): Promise<ActionState & { member?: AdminMember }> {
  const { supabase } = await requireAdmin();
  const parsed = validate(teamMemberSchema, input);
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);
  const { data: last } = await supabase.from("team_members").select("position").order("position", { ascending: false }).limit(1);
  const { data, error } = await supabase
    .from("team_members")
    .insert({ ...parsed.data, position: (last?.[0]?.position ?? -1) + 1 })
    .select("id, name, role, bio, photo_path")
    .single();
  if (error) {
    logError("ajout impossible", error.message);
    return failure(SAVE_FAILED);
  }
  publish();
  return { ...success("Membre ajouté. Il apparaît sur la page Le studio."), member: data };
}

export async function updateMember(memberId: unknown, input: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const mid = id.safeParse(memberId);
  if (!mid.success) return failure(NOT_FOUND);
  const parsed = validate(teamMemberSchema, input);
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);
  const { data, error } = await supabase.from("team_members").update(parsed.data).eq("id", mid.data).select("id");
  if (error || data.length === 0) {
    if (error) logError("enregistrement impossible", error.message);
    return failure(error ? SAVE_FAILED : NOT_FOUND);
  }
  publish();
  return success("Membre enregistré.");
}

export async function reorderMembers(ids: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = orderSchema.safeParse(ids);
  if (!parsed.success) return failure(SAVE_FAILED);
  const results = await Promise.all(
    parsed.data.map((memberId, position) => supabase.from("team_members").update({ position }).eq("id", memberId).select("id")),
  );
  publish();
  const failed = results.find((r) => r.error || r.data?.length === 0);
  if (failed) {
    if (failed.error) logError("enregistrement de l'ordre impossible", failed.error.message);
    return failure("L’ordre n’a pas pu être enregistré entièrement. Rechargez la page et réessayez.");
  }
  return success("Ordre enregistré. Il est appliqué sur la page Le studio.");
}

async function currentPhoto(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], memberId: string) {
  const { data } = await supabase.from("team_members").select("photo_path").eq("id", memberId).maybeSingle();
  return data;
}

/** Enregistre une photo déjà téléversée ; l'ancienne est supprimée du bucket si elle y est. */
export async function setMemberPhoto(memberId: unknown, path: unknown): Promise<ActionState & { path?: string }> {
  const { supabase } = await requireAdmin();
  const mid = id.safeParse(memberId);
  if (!mid.success || typeof path !== "string" || !isTeamPhotoPath(mid.data, path)) return failure(SAVE_FAILED);
  const member = await currentPhoto(supabase, mid.data);
  if (!member) {
    await removeMediaFiles(supabase, [path]);
    return failure(NOT_FOUND);
  }
  const { data, error } = await supabase.from("team_members").update({ photo_path: path }).eq("id", mid.data).select("id");
  if (error || data.length === 0) {
    if (error) logError("enregistrement de la photo impossible", error.message);
    await removeMediaFiles(supabase, [path]);
    return failure("La photo n’a pas pu être enregistrée. Réessayez.");
  }
  if (member.photo_path !== path) await removeMediaFiles(supabase, [member.photo_path]);
  publish();
  return { ...success("Photo enregistrée. Elle est en ligne sur la page Le studio."), path };
}

export async function removeMemberPhoto(memberId: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const mid = id.safeParse(memberId);
  if (!mid.success) return failure(SAVE_FAILED);
  const member = await currentPhoto(supabase, mid.data);
  if (!member) return failure(NOT_FOUND);
  const { data, error } = await supabase.from("team_members").update({ photo_path: null }).eq("id", mid.data).select("id");
  if (error || data.length === 0) {
    if (error) logError("retrait de la photo impossible", error.message);
    return failure("La photo n’a pas pu être retirée. Réessayez.");
  }
  await removeMediaFiles(supabase, [member.photo_path]);
  publish();
  return success("Photo retirée. Les initiales s’affichent à la place.");
}

export async function deleteMember(memberId: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const mid = id.safeParse(memberId);
  if (!mid.success) return failure(NOT_FOUND);
  const { data, error } = await supabase.from("team_members").delete().eq("id", mid.data).select("photo_path");
  if (error || data.length === 0) {
    if (error) logError("suppression impossible", error.message);
    return failure(error ? "La suppression a échoué. Réessayez dans un instant." : NOT_FOUND);
  }
  const strays = await listMediaFiles(supabase, "team", `${mid.data}-`);
  await removeMediaFiles(supabase, [data[0].photo_path, ...strays]);
  publish();
  return success("Membre supprimé, avec sa photo.");
}

/** Supprime une photo téléversée dont l'enregistrement n'a pas abouti (jamais une photo en place). */
export async function discardMemberUpload(memberId: unknown, path: unknown): Promise<void> {
  const { supabase } = await requireAdmin();
  const mid = id.safeParse(memberId);
  if (!mid.success || typeof path !== "string" || !isTeamPhotoPath(mid.data, path)) return;
  const member = await currentPhoto(supabase, mid.data);
  if (member?.photo_path === path) return;
  await removeMediaFiles(supabase, [path]);
}
