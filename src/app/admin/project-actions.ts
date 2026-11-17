"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { failure, success, type ActionState } from "@/lib/admin/action-state";
import { requireAdmin } from "@/lib/admin/auth";
import { isProjectPhotoPath, isProjectThumbnailPath } from "@/lib/admin/images";
import {
  projectOrderSchema,
  projectSchema,
  uploadedPhotosSchema,
  validate,
  type ProjectData,
} from "@/lib/admin/schemas";
import { CACHE_TAGS, projectTag } from "@/lib/data/tags";
import type { Tables } from "@/types/database";

// Server Actions de l'onglet Projets (cahier 7.2). Chaque action appelle
// requireAdmin(), valide avec zod et écrit avec le client à cookies (RLS
// is_admin), jamais avec la clé service. Après chaque enregistrement
// réussi, le site est invalidé (updateTag, D71) : liste, accueil et fiches.

const FIX_FIELDS = "Certains champs sont à corriger.";
const SAVE_FAILED = "L’enregistrement a échoué. Réessayez dans un instant.";
const NOT_FOUND = "Ce projet n’existe plus. Rechargez la liste des projets.";
const BUCKET = "media";

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export type ProjectActionResult = ActionState & { id?: string; slug?: string };
export type SavedPhoto = Pick<Tables<"project_photos">, "id" | "storage_path" | "alt" | "width" | "height">;

const projectId = z.uuid();

function logError(context: string, message: string) {
  console.error(`[MANA PROD] Dashboard projets : ${context} (${message}).`);
}

/** Invalide la liste, l'accueil et les fiches concernées. */
function publish(...slugs: (string | null | undefined)[]) {
  updateTag(CACHE_TAGS.projects);
  for (const slug of new Set(slugs.filter((s): s is string => Boolean(s)))) {
    updateTag(projectTag(slug));
  }
}

/** Supprime des fichiers du bucket ; un échec est consigné, jamais bloquant. */
async function removeFiles(supabase: Supabase, paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))].filter((p) => !p.startsWith("/"));
  if (unique.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(unique);
  if (error) logError("suppression de fichiers impossible", error.message);
}

/** Erreur de slug déjà pris, ou null si l'adresse est libre. */
async function slugTaken(supabase: Supabase, slug: string, exceptId?: string): Promise<boolean | null> {
  let query = supabase.from("projects").select("id").eq("slug", slug).limit(1);
  if (exceptId) query = query.neq("id", exceptId);
  const { data, error } = await query;
  if (error) {
    logError("vérification de l'adresse impossible", error.message);
    return null;
  }
  return data.length > 0;
}

const SLUG_TAKEN = "Cette adresse est déjà utilisée par un autre projet. Choisissez-en une autre.";

function projectRow(data: ProjectData) {
  return {
    client: data.client,
    title: data.title,
    slug: data.slug,
    category: data.category,
    year: data.year,
    description: data.description,
    deliverables: data.deliverables,
    featured: data.featured,
    published: data.published,
  };
}

/** Vidéos : mises à jour, ajouts, puis retraits (ordre de la liste = position). */
async function saveVideos(supabase: Supabase, id: string, videos: ProjectData["videos"]): Promise<boolean> {
  const { data: existing, error } = await supabase.from("project_videos").select("id").eq("project_id", id);
  if (error) {
    logError("lecture des vidéos impossible", error.message);
    return false;
  }
  const existingIds = new Set(existing.map((v) => v.id));
  const keep = new Set<string>();

  for (const [position, video] of videos.entries()) {
    const values = { youtube_url: video.url, youtube_id: video.youtubeId, title: video.title, position };
    if (video.id && existingIds.has(video.id)) {
      keep.add(video.id);
      const { error: updateError } = await supabase
        .from("project_videos")
        .update(values)
        .eq("id", video.id)
        .eq("project_id", id);
      if (updateError) {
        logError("mise à jour d'une vidéo impossible", updateError.message);
        return false;
      }
    } else {
      const { error: insertError } = await supabase.from("project_videos").insert({ ...values, project_id: id });
      if (insertError) {
        logError("ajout d'une vidéo impossible", insertError.message);
        return false;
      }
    }
  }

  const removed = [...existingIds].filter((v) => !keep.has(v));
  if (removed.length > 0) {
    const { error: deleteError } = await supabase.from("project_videos").delete().in("id", removed);
    if (deleteError) {
      logError("retrait de vidéos impossible", deleteError.message);
      return false;
    }
  }
  return true;
}

/** Photos : texte alternatif et position (ordre de la liste). */
async function savePhotos(supabase: Supabase, id: string, photos: ProjectData["photos"]): Promise<boolean> {
  for (const [position, photo] of photos.entries()) {
    const { error } = await supabase
      .from("project_photos")
      .update({ alt: photo.alt, position })
      .eq("id", photo.id)
      .eq("project_id", id);
    if (error) {
      logError("mise à jour d'une photo impossible", error.message);
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------
// Projet : création, modification, suppression, ordre
// ---------------------------------------------------------------------

export async function createProject(input: unknown): Promise<ProjectActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = validate(projectSchema, input);
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);
  const data = parsed.data;

  const taken = await slugTaken(supabase, data.slug);
  if (taken === null) return failure(SAVE_FAILED);
  if (taken) return failure(FIX_FIELDS, { slug: SLUG_TAKEN });

  // Nouveau projet en fin de liste.
  const { data: last, error: lastError } = await supabase
    .from("projects")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  if (lastError) {
    logError("lecture de l'ordre impossible", lastError.message);
    return failure(SAVE_FAILED);
  }
  const position = (last[0]?.position ?? -1) + 1;

  const { data: created, error } = await supabase
    .from("projects")
    .insert({ ...projectRow(data), position })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return failure(FIX_FIELDS, { slug: SLUG_TAKEN });
    logError("création impossible", error.message);
    return failure(SAVE_FAILED);
  }

  const videosSaved = await saveVideos(supabase, created.id, data.videos);
  publish(data.slug);
  if (!videosSaved) {
    return {
      ...failure("Le projet est créé, mais ses vidéos n’ont pas pu être enregistrées. Vérifiez-les et enregistrez de nouveau."),
      id: created.id,
    };
  }
  return { ...success("Projet créé. Ajoutez maintenant la miniature et les photos."), id: created.id, slug: data.slug };
}

export async function updateProject(id: unknown, input: unknown): Promise<ProjectActionResult> {
  const { supabase } = await requireAdmin();
  const pid = projectId.safeParse(id);
  if (!pid.success) return failure(NOT_FOUND);
  const parsed = validate(projectSchema, input);
  if (!parsed.ok) return failure(FIX_FIELDS, parsed.errors);
  const data = parsed.data;

  const { data: current, error: readError } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", pid.data)
    .maybeSingle();
  if (readError) {
    logError("lecture du projet impossible", readError.message);
    return failure(SAVE_FAILED);
  }
  if (!current) return failure(NOT_FOUND);

  if (data.slug !== current.slug) {
    const taken = await slugTaken(supabase, data.slug, pid.data);
    if (taken === null) return failure(SAVE_FAILED);
    if (taken) return failure(FIX_FIELDS, { slug: SLUG_TAKEN });
  }

  const { data: updated, error } = await supabase
    .from("projects")
    .update(projectRow(data))
    .eq("id", pid.data)
    .select("id");
  if (error) {
    if (error.code === "23505") return failure(FIX_FIELDS, { slug: SLUG_TAKEN });
    logError("enregistrement impossible", error.message);
    return failure(SAVE_FAILED);
  }
  if (updated.length === 0) return failure(SAVE_FAILED);

  const saved = (await saveVideos(supabase, pid.data, data.videos)) && (await savePhotos(supabase, pid.data, data.photos));
  publish(data.slug, current.slug);
  if (!saved) return failure("Les informations sont enregistrées, mais pas toutes les vidéos ou photos. Réessayez.");
  return { ...success(data.published ? "Projet enregistré. Il est en ligne." : "Projet enregistré (brouillon, non visible sur le site)."), id: pid.data, slug: data.slug };
}

export async function deleteProject(id: unknown): Promise<ProjectActionResult> {
  const { supabase } = await requireAdmin();
  const pid = projectId.safeParse(id);
  if (!pid.success) return failure(NOT_FOUND);

  const { data: project, error: readError } = await supabase
    .from("projects")
    .select("slug, thumbnail_path, project_photos(storage_path)")
    .eq("id", pid.data)
    .maybeSingle();
  if (readError) {
    logError("lecture du projet impossible", readError.message);
    return failure(SAVE_FAILED);
  }
  if (!project) return failure(NOT_FOUND);

  // Vidéos et photos supprimées en cascade (clés étrangères, migration 0001).
  const { data: deleted, error } = await supabase.from("projects").delete().eq("id", pid.data).select("id");
  if (error || deleted.length === 0) {
    if (error) logError("suppression impossible", error.message);
    return failure("La suppression a échoué. Réessayez dans un instant.");
  }

  // Fichiers : ceux connus en base, plus tout fichier resté dans le dossier
  // du projet ou parmi ses miniatures.
  const paths = [project.thumbnail_path ?? "", ...project.project_photos.map((p) => p.storage_path)];
  const [folder, thumbs] = await Promise.all([
    supabase.storage.from(BUCKET).list(`projects/${pid.data}`, { limit: 1000 }),
    supabase.storage.from(BUCKET).list("thumbs", { limit: 1000, search: pid.data }),
  ]);
  for (const file of folder.data ?? []) paths.push(`projects/${pid.data}/${file.name}`);
  for (const file of thumbs.data ?? []) {
    if (file.name.startsWith(`${pid.data}-`)) paths.push(`thumbs/${file.name}`);
  }
  await removeFiles(supabase, paths);

  publish(project.slug);
  return success("Projet supprimé, avec ses vidéos, ses photos et ses fichiers.");
}

/** Enregistre l'ordre complet des projets en une seule action. */
export async function reorderProjects(ids: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = projectOrderSchema.safeParse(ids);
  if (!parsed.success) return failure(SAVE_FAILED);

  const results = await Promise.all(
    parsed.data.map((id, position) =>
      supabase.from("projects").update({ position }).eq("id", id).select("id"),
    ),
  );
  const failed = results.find((r) => r.error || r.data?.length === 0);
  publish();
  if (failed) {
    if (failed.error) logError("enregistrement de l'ordre impossible", failed.error.message);
    return failure("L’ordre n’a pas pu être enregistré entièrement. Rechargez la page et réessayez.");
  }
  return success("Ordre enregistré. Il est appliqué sur le site.");
}

// ---------------------------------------------------------------------
// Miniature et photos (fichiers déjà téléversés par le navigateur)
// ---------------------------------------------------------------------

async function projectSlug(supabase: Supabase, id: string): Promise<{ slug: string; thumbnail_path: string | null } | null> {
  const { data, error } = await supabase.from("projects").select("slug, thumbnail_path").eq("id", id).maybeSingle();
  if (error) logError("lecture du projet impossible", error.message);
  return data ?? null;
}

/**
 * Enregistre des photos téléversées. En cas d'échec, les fichiers sont
 * supprimés (aucun fichier orphelin).
 */
export async function addProjectPhotos(
  id: unknown,
  photos: unknown,
): Promise<ActionState & { photos?: SavedPhoto[] }> {
  const { supabase } = await requireAdmin();
  const pid = projectId.safeParse(id);
  const parsed = uploadedPhotosSchema.safeParse(photos);
  if (!pid.success || !parsed.success) return failure(SAVE_FAILED);
  // Seuls les chemins du dossier de ce projet sont acceptés.
  const valid = parsed.data.filter((p) => isProjectPhotoPath(pid.data, p.path));
  if (valid.length !== parsed.data.length) return failure(SAVE_FAILED);

  const project = await projectSlug(supabase, pid.data);
  if (!project) {
    await removeFiles(supabase, valid.map((p) => p.path));
    return failure(NOT_FOUND);
  }

  const { data: last } = await supabase
    .from("project_photos")
    .select("position")
    .eq("project_id", pid.data)
    .order("position", { ascending: false })
    .limit(1);
  const start = (last?.[0]?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("project_photos")
    .insert(
      valid.map((p, i) => ({
        project_id: pid.data,
        storage_path: p.path,
        width: p.width,
        height: p.height,
        position: start + i,
      })),
    )
    .select("id, storage_path, alt, width, height, position")
    .order("position", { ascending: true });
  if (error) {
    logError("enregistrement des photos impossible", error.message);
    await removeFiles(supabase, valid.map((p) => p.path));
    return failure("Les photos n’ont pas pu être enregistrées. Réessayez.");
  }

  publish(project.slug);
  const saved = data.map(({ id: photoId, storage_path, alt, width, height }) => ({ id: photoId, storage_path, alt, width, height }));
  return { ...success(saved.length > 1 ? `${saved.length} photos ajoutées.` : "Photo ajoutée."), photos: saved };
}

export async function deleteProjectPhoto(photoId: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = projectId.safeParse(photoId);
  if (!parsed.success) return failure(SAVE_FAILED);

  const { data: deleted, error } = await supabase
    .from("project_photos")
    .delete()
    .eq("id", parsed.data)
    .select("storage_path, project_id");
  if (error || deleted.length === 0) {
    if (error) logError("suppression de la photo impossible", error.message);
    return failure("La photo n’a pas pu être supprimée. Réessayez.");
  }
  await removeFiles(supabase, [deleted[0].storage_path]);
  const project = await projectSlug(supabase, deleted[0].project_id);
  publish(project?.slug);
  return success("Photo supprimée.");
}

/** Remplace la miniature ; l'ancien fichier est supprimé. */
export async function setProjectThumbnail(id: unknown, path: unknown): Promise<ActionState & { path?: string }> {
  const { supabase } = await requireAdmin();
  const pid = projectId.safeParse(id);
  if (!pid.success || typeof path !== "string" || !isProjectThumbnailPath(pid.data, path)) return failure(SAVE_FAILED);

  const project = await projectSlug(supabase, pid.data);
  if (!project) {
    await removeFiles(supabase, [path]);
    return failure(NOT_FOUND);
  }
  const { data, error } = await supabase
    .from("projects")
    .update({ thumbnail_path: path })
    .eq("id", pid.data)
    .select("id");
  if (error || data.length === 0) {
    if (error) logError("enregistrement de la miniature impossible", error.message);
    await removeFiles(supabase, [path]);
    return failure("La miniature n’a pas pu être enregistrée. Réessayez.");
  }
  if (project.thumbnail_path && project.thumbnail_path !== path) await removeFiles(supabase, [project.thumbnail_path]);
  publish(project.slug);
  return { ...success("Miniature enregistrée."), path };
}

export async function removeProjectThumbnail(id: unknown): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const pid = projectId.safeParse(id);
  if (!pid.success) return failure(SAVE_FAILED);

  const project = await projectSlug(supabase, pid.data);
  if (!project) return failure(NOT_FOUND);
  const { data, error } = await supabase
    .from("projects")
    .update({ thumbnail_path: null })
    .eq("id", pid.data)
    .select("id");
  if (error || data.length === 0) {
    if (error) logError("retrait de la miniature impossible", error.message);
    return failure("La miniature n’a pas pu être retirée. Réessayez.");
  }
  if (project.thumbnail_path) await removeFiles(supabase, [project.thumbnail_path]);
  publish(project.slug);
  return success("Miniature retirée. Le site utilise celle de la première vidéo, sinon la première photo.");
}

/**
 * Supprime des fichiers téléversés par le navigateur dont l'enregistrement
 * n'a pas abouti (aucun fichier orphelin). Seuls les chemins de ce projet.
 */
export async function discardUploads(id: unknown, paths: unknown): Promise<void> {
  const { supabase } = await requireAdmin();
  const pid = projectId.safeParse(id);
  if (!pid.success || !Array.isArray(paths)) return;
  const own = paths.filter(
    (p): p is string =>
      typeof p === "string" && (isProjectPhotoPath(pid.data, p) || isProjectThumbnailPath(pid.data, p)),
  );
  if (own.length === 0) return;
  // Jamais un fichier encore utilisé par une photo ou la miniature.
  const [{ data: photos }, { data: project }] = await Promise.all([
    supabase.from("project_photos").select("storage_path").in("storage_path", own),
    supabase.from("projects").select("thumbnail_path").eq("id", pid.data).maybeSingle(),
  ]);
  if (!photos) return;
  const used = new Set([...photos.map((p) => p.storage_path), project?.thumbnail_path ?? ""]);
  await removeFiles(supabase, own.filter((p) => !used.has(p)));
}
