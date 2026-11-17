"use server";

import { updateTag } from "next/cache";
import { z } from "@/lib/zod";
import { failure, success, type ActionState } from "@/lib/admin/action-state";
import { requireAdmin } from "@/lib/admin/auth";
import { isBackstagePath, isStudioHeroPath } from "@/lib/admin/images";
import { backstageAltSchema, BACKSTAGE_LIMITS, orderSchema, uploadedPhotosSchema, validate } from "@/lib/admin/schemas";
import { removeMediaFiles } from "@/lib/admin/storage";
import { isMissingTable } from "@/lib/data/backstage";
import { CACHE_TAGS } from "@/lib/data/tags";
import { STUDIO_HERO_DEFAULT } from "@/lib/studio";
import type { Tables } from "@/types/database";

// Server Actions de la page Le studio (D99) : photo d'ouverture (onglet
// Réglages, étiquette settings) et photos des coulisses (onglet Coulisses,
// étiquette backstage). requireAdmin(), zod, client à cookies (RLS
// is_admin) ; aucun fichier orphelin ; les chemins statiques (« /team/... »)
// ne sont jamais supprimés du bucket.

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
export type SavedBackstagePhoto = Pick<Tables<"backstage_photos">, "id" | "storage_path" | "alt" | "width" | "height">;

const SAVE_FAILED = "L’enregistrement a échoué. Réessayez dans un instant.";
const MIGRATION_NEEDED =
  "La base n’est pas encore prête pour cette fonction : la migration 0004 doit être exécutée dans Supabase.";
const id = z.uuid();

function logError(context: string, message: string) {
  console.error(`[MANA PROD] Dashboard studio : ${context} (${message}).`);
}

/** Colonne ou table absente : migration 0004 pas encore exécutée. */
function missingMigration(error: { code?: string | null; message: string }): boolean {
  return isMissingTable(error) || error.code === "42703" || /studio_hero_path/.test(error.message);
}

// ---------------------------------------------------------------------
// Photo d'ouverture
// ---------------------------------------------------------------------

async function currentHero(supabase: Supabase): Promise<{ path: string | null } | { error: string }> {
  const { data, error } = await supabase.from("site_settings").select("studio_hero_path").eq("id", 1).maybeSingle();
  if (error) {
    if (missingMigration(error)) return { error: MIGRATION_NEEDED };
    logError("lecture de la photo d'ouverture impossible", error.message);
    return { error: SAVE_FAILED };
  }
  if (!data) return { error: SAVE_FAILED };
  return { path: data.studio_hero_path };
}

async function writeHero(supabase: Supabase, path: string): Promise<string | null> {
  const { data, error } = await supabase.from("site_settings").update({ studio_hero_path: path }).eq("id", 1).select("id");
  if (error) {
    if (missingMigration(error)) return MIGRATION_NEEDED;
    logError("enregistrement de la photo d'ouverture impossible", error.message);
    return SAVE_FAILED;
  }
  return data.length === 0 ? SAVE_FAILED : null;
}

/** Enregistre une photo d'ouverture déjà téléversée ; l'ancienne est supprimée si elle est dans le bucket. */
export async function setStudioHero(path: unknown): Promise<ActionState & { path?: string }> {
  const { supabase } = await requireAdmin();
  if (typeof path !== "string" || !isStudioHeroPath(path)) return failure(SAVE_FAILED);
  const current = await currentHero(supabase);
  if ("error" in current) {
    await removeMediaFiles(supabase, [path]);
    return failure(current.error);
  }
  const error = await writeHero(supabase, path);
  if (error) {
    await removeMediaFiles(supabase, [path]);
    return failure(error);
  }
  if (current.path !== path) await removeMediaFiles(supabase, [current.path]);
  updateTag(CACHE_TAGS.settings);
  return { ...success("Photo d’ouverture enregistrée. Elle est en ligne sur la page Le studio."), path };
}

/** Revient à la photo de départ (dossier public) ; la photo téléversée est supprimée. */
export async function resetStudioHero(): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const current = await currentHero(supabase);
  if ("error" in current) return failure(current.error);
  const error = await writeHero(supabase, STUDIO_HERO_DEFAULT);
  if (error) return failure(error);
  if (current.path !== STUDIO_HERO_DEFAULT) await removeMediaFiles(supabase, [current.path]);
  updateTag(CACHE_TAGS.settings);
  return success("Photo de départ rétablie sur la page Le studio.");
}

/** Supprime une photo d'ouverture téléversée dont l'enregistrement n'a pas abouti. */
export async function discardStudioUpload(path: unknown): Promise<void> {
  const { supabase } = await requireAdmin();
  if (typeof path !== "string" || !isStudioHeroPath(path)) return;
  const current = await currentHero(supabase);
  if ("path" in current && current.path === path) return;
  await removeMediaFiles(supabase, [path]);
}

// ---------------------------------------------------------------------
// Photos des coulisses
// ---------------------------------------------------------------------

function publishBackstage() {
  updateTag(CACHE_TAGS.backstage);
}

/** Enregistre des photos téléversées ; en cas d'échec, les fichiers sont supprimés. */
export async function addBackstagePhotos(photos: unknown): Promise<ActionState & { photos?: SavedBackstagePhoto[] }> {
  const { supabase } = await requireAdmin();
  const parsed = uploadedPhotosSchema.safeParse(photos);
  if (!parsed.success || !parsed.data.every((p) => isBackstagePath(p.path))) return failure(SAVE_FAILED);
  const paths = parsed.data.map((p) => p.path);

  const { data: last, error: lastError } = await supabase
    .from("backstage_photos")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  if (lastError) {
    await removeMediaFiles(supabase, paths);
    if (missingMigration(lastError)) return failure(MIGRATION_NEEDED);
    logError("lecture de l'ordre impossible", lastError.message);
    return failure(SAVE_FAILED);
  }
  const { count } = await supabase.from("backstage_photos").select("id", { count: "exact", head: true });
  if ((count ?? 0) + parsed.data.length > BACKSTAGE_LIMITS.photos) {
    await removeMediaFiles(supabase, paths);
    return failure(`${BACKSTAGE_LIMITS.photos} photos au maximum dans les coulisses.`);
  }
  const start = (last[0]?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("backstage_photos")
    .insert(parsed.data.map((p, i) => ({ storage_path: p.path, width: p.width, height: p.height, position: start + i })))
    .select("id, storage_path, alt, width, height");
  if (error) {
    logError("enregistrement des photos impossible", error.message);
    await removeMediaFiles(supabase, paths);
    return failure("Les photos n’ont pas pu être enregistrées. Réessayez.");
  }
  publishBackstage();
  return { ...success(data.length > 1 ? `${data.length} photos ajoutées.` : "Photo ajoutée."), photos: data };
}

export async function updateBackstageAlt(photoId: unknown, input: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const pid = id.safeParse(photoId);
  if (!pid.success) return failure(SAVE_FAILED);
  const parsed = validate(backstageAltSchema, input);
  if (!parsed.ok) return failure("Certains champs sont à corriger.", parsed.errors);
  const { data, error } = await supabase
    .from("backstage_photos")
    .update({ alt: parsed.data.alt })
    .eq("id", pid.data)
    .select("id");
  if (error || data.length === 0) {
    if (error) logError("enregistrement du texte impossible", error.message);
    return failure(SAVE_FAILED);
  }
  publishBackstage();
  return success("Texte alternatif enregistré.");
}

export async function reorderBackstage(ids: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = orderSchema.safeParse(ids);
  if (!parsed.success) return failure(SAVE_FAILED);
  const results = await Promise.all(
    parsed.data.map((photoId, position) =>
      supabase.from("backstage_photos").update({ position }).eq("id", photoId).select("id"),
    ),
  );
  publishBackstage();
  const failed = results.find((r) => r.error || r.data?.length === 0);
  if (failed) {
    if (failed.error) logError("enregistrement de l'ordre impossible", failed.error.message);
    return failure("L’ordre n’a pas pu être enregistré entièrement. Rechargez la page et réessayez.");
  }
  return success("Ordre enregistré. Il est appliqué sur la page Le studio.");
}

export async function deleteBackstagePhoto(photoId: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const pid = id.safeParse(photoId);
  if (!pid.success) return failure(SAVE_FAILED);
  const { data, error } = await supabase.from("backstage_photos").delete().eq("id", pid.data).select("storage_path");
  if (error || data.length === 0) {
    if (error) logError("suppression impossible", error.message);
    return failure("La photo n’a pas pu être supprimée. Réessayez.");
  }
  await removeMediaFiles(supabase, [data[0].storage_path]);
  publishBackstage();
  return success("Photo supprimée.");
}

/** Supprime des photos téléversées dont l'enregistrement n'a pas abouti (jamais une photo en place). */
export async function discardBackstageUploads(paths: unknown): Promise<void> {
  const { supabase } = await requireAdmin();
  if (!Array.isArray(paths)) return;
  const own = paths.filter((p): p is string => typeof p === "string" && isBackstagePath(p));
  if (own.length === 0) return;
  const { data, error } = await supabase.from("backstage_photos").select("storage_path").in("storage_path", own);
  if (error && !missingMigration(error)) return;
  const used = new Set((data ?? []).map((p) => p.storage_path));
  await removeMediaFiles(supabase, own.filter((p) => !used.has(p)));
}
