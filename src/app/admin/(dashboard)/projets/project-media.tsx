"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import {
  addProjectPhotos,
  deleteProjectPhoto,
  discardUploads,
  removeProjectThumbnail,
  setProjectThumbnail,
} from "@/app/admin/project-actions";
import { errorProps, inputClass } from "@/components/admin/field";
import { ImageError, prepareImage, uploadImage } from "@/components/admin/image-upload";
import { Panel } from "@/components/admin/page-head";
import { ProjectThumb } from "@/components/admin/project-thumb";
import { useFocusLater } from "@/components/admin/use-focus-later";
import { btnDanger, btnLine, btnSmall, iconBtn, iconBtnDanger } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/action-state";
import { photoPath, PHOTO_MAX_SIDE, thumbnailPath, THUMBNAIL_MAX_SIDE } from "@/lib/admin/images";
import { moveItem } from "@/lib/admin/list";
import { PROJECT_LIMITS, type FieldErrors } from "@/lib/admin/schemas";
import { mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

export type PhotoRow = { id: string; path: string; alt: string; width: number | null; height: number | null };
type SavedPhotoRef = { id: string; alt: string };

type UploadItem = { key: string; name: string; status: "attente" | "preparation" | "envoi" | "fait" | "erreur"; message?: string };

const STATUS_LABEL: Record<UploadItem["status"], string> = {
  attente: "En attente",
  preparation: "Compression",
  envoi: "Envoi en cours",
  fait: "Ajoutée",
  erreur: "Échec",
};

const errorMessage = (error: unknown) =>
  error instanceof ImageError ? error.message : "L’envoi a échoué. Vérifiez la connexion et réessayez.";

// Miniature et photos d'un projet (cahier 7.2) : téléversement direct du
// navigateur vers le bucket media (D79), puis enregistrement en base par une
// Server Action ; un fichier dont l'enregistrement échoue est supprimé.
export function ProjectMedia({
  projectId,
  client,
  thumbnailPath: currentThumbnail,
  onThumbnail,
  fallbackVideoId,
  photos,
  errors,
  onPhotos,
  onSavedPhotos,
  notify,
}: {
  projectId: string;
  client: string;
  thumbnailPath: string | null;
  onThumbnail: (path: string | null) => void;
  fallbackVideoId: string | null;
  photos: PhotoRow[];
  errors: FieldErrors;
  onPhotos: (update: (photos: PhotoRow[]) => PhotoRow[]) => void;
  onSavedPhotos: (update: (photos: SavedPhotoRef[]) => SavedPhotoRef[]) => void;
  notify: (state: ActionState) => void;
}) {
  const [thumbBusy, setThumbBusy] = useState<string | null>(null);
  // Préfixe propre à cette instance : identifiants uniques même quand le
  // routeur garde plusieurs éditeurs en mémoire (pages masquées).
  const ns = useId();
  const [thumbError, setThumbError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [busyPhoto, setBusyPhoto] = useState<string | null>(null);
  const [confirmPhoto, setConfirmPhoto] = useState<string | null>(null);
  const setFocusId = useFocusLater();
  const photoInput = useRef<HTMLInputElement>(null);
  const thumbInput = useRef<HTMLInputElement>(null);
  const uploading = uploads.some((u) => u.status !== "fait" && u.status !== "erreur");


  // -------------------------------------------------------------------
  // Miniature
  // -------------------------------------------------------------------

  async function chooseThumbnail(file: File | undefined) {
    if (!file) return;
    setThumbError(null);
    setThumbBusy("Compression de l’image");
    let path: string | null = null;
    try {
      const image = await prepareImage(file, THUMBNAIL_MAX_SIDE);
      path = thumbnailPath(projectId, crypto.randomUUID(), image.ext);
      setThumbBusy("Envoi en cours");
      await uploadImage(createClient(), path, image);
      setThumbBusy("Enregistrement");
      const result = await setProjectThumbnail(projectId, path);
      if (result.status === "error") {
        setThumbError(result.message ?? null);
        notify(result);
      } else {
        onThumbnail(path);
        notify(result);
      }
    } catch (error) {
      if (path) await discardUploads(projectId, [path]).catch(() => undefined);
      const message = errorMessage(error);
      setThumbError(message);
      notify({ status: "error", message });
    } finally {
      setThumbBusy(null);
      if (thumbInput.current) thumbInput.current.value = "";
    }
  }

  async function clearThumbnail() {
    if (!window.confirm("Retirer la miniature ? Le site utilisera celle de la première vidéo.")) return;
    setThumbBusy("Retrait en cours");
    const result = await removeProjectThumbnail(projectId);
    setThumbBusy(null);
    if (result.status === "success") {
      onThumbnail(null);
      setFocusId(`${ns}-thumb-choisir`);
    }
    notify(result);
  }

  // -------------------------------------------------------------------
  // Photos
  // -------------------------------------------------------------------

  async function choosePhotos(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (photoInput.current) photoInput.current.value = "";
    if (files.length === 0) return;
    const room = PROJECT_LIMITS.photos - photos.length;
    const accepted = files.slice(0, Math.max(0, room));
    const items: UploadItem[] = accepted.map((f) => ({ key: crypto.randomUUID(), name: f.name, status: "attente" }));
    setUploads(items);
    const update = (key: string, patch: Partial<UploadItem>) =>
      setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...patch } : u)));

    const supabase = createClient();
    let added = 0;
    for (const [i, file] of accepted.entries()) {
      const key = items[i].key;
      let path: string | null = null;
      try {
        update(key, { status: "preparation" });
        const image = await prepareImage(file, PHOTO_MAX_SIDE);
        path = photoPath(projectId, crypto.randomUUID(), image.ext);
        update(key, { status: "envoi" });
        await uploadImage(supabase, path, image);
        const result = await addProjectPhotos(projectId, [{ path, width: image.width, height: image.height }]);
        if (result.status === "error" || !result.photos) {
          update(key, { status: "erreur", message: result.message });
          continue;
        }
        const rows = result.photos.map((p) => ({
          id: p.id,
          path: p.storage_path,
          alt: p.alt ?? "",
          width: p.width,
          height: p.height,
        }));
        onPhotos((list) => [...list, ...rows]);
        onSavedPhotos((list) => [...list, ...rows.map((r) => ({ id: r.id, alt: r.alt }))]);
        update(key, { status: "fait" });
        added += rows.length;
      } catch (error) {
        if (path) await discardUploads(projectId, [path]).catch(() => undefined);
        update(key, { status: "erreur", message: errorMessage(error) });
      }
    }
    const failed = accepted.length - added;
    const skipped = files.length - accepted.length;
    if (failed === 0 && skipped === 0) {
      notify({ status: "success", message: added > 1 ? `${added} photos ajoutées.` : "Photo ajoutée." });
    } else {
      notify({
        status: "error",
        message:
          `${added} photo${added > 1 ? "s" : ""} ajoutée${added > 1 ? "s" : ""}, ${failed + skipped} non ajoutée${failed + skipped > 1 ? "s" : ""}.` +
          (skipped ? ` Limite de ${PROJECT_LIMITS.photos} photos atteinte.` : " Voir le détail sous le bouton."),
      });
    }
  }

  function movePhoto(index: number, delta: number) {
    const moved = photos[index];
    const newIndex = index + delta;
    const canContinue = delta < 0 ? newIndex > 0 : newIndex < photos.length - 1;
    onPhotos((list) => moveItem(list, index, delta));
    setFocusId(`ph-${moved.id}-${canContinue === delta < 0 ? "up" : "down"}`);
  }

  async function removePhoto(index: number) {
    const photo = photos[index];
    setBusyPhoto(photo.id);
    const result = await deleteProjectPhoto(photo.id);
    setBusyPhoto(null);
    setConfirmPhoto(null);
    if (result.status === "success") {
      onPhotos((list) => list.filter((p) => p.id !== photo.id));
      onSavedPhotos((list) => list.filter((p) => p.id !== photo.id));
      const neighbour = photos.filter((p) => p.id !== photo.id)[Math.min(index, photos.length - 2)];
      setFocusId(neighbour ? `ph-${neighbour.id}-remove` : `${ns}-ph-choisir`);
    }
    notify(result);
  }

  const doneCount = uploads.filter((u) => u.status === "fait" || u.status === "erreur").length;

  return (
    <>
      <Panel title="Miniature">
        <div className="flex flex-wrap items-start gap-5">
          <div className="relative aspect-[16/10] w-[260px] max-w-full overflow-hidden border border-line bg-bg">
            <ProjectThumb thumbnailPath={currentThumbnail} videoId={fallbackVideoId} client={client} sizes="260px" />
          </div>
          <div className="min-w-0 flex-[1_1_260px]">
            <p className="mb-4 text-sm text-muted">
              {currentThumbnail
                ? "Miniature personnalisée."
                : "Miniature automatique : celle de la première vidéo YouTube. Téléversez une image pour la remplacer."}{" "}
              Image réduite à {THUMBNAIL_MAX_SIDE} px avant l’envoi.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <label
                className={`${btnLine} ${btnSmall} cursor-pointer has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-teal ${thumbBusy ? "pointer-events-none opacity-50" : ""}`}
              >
                <ImagePlus size={16} strokeWidth={1.8} aria-hidden="true" />
                {currentThumbnail ? "Remplacer la miniature" : "Téléverser une miniature"}
                <input
                  id={`${ns}-thumb-choisir`}
                  ref={thumbInput}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={Boolean(thumbBusy)}
                  onChange={(e) => chooseThumbnail(e.target.files?.[0])}
                />
              </label>
              {currentThumbnail ? (
                <button type="button" onClick={clearThumbnail} disabled={Boolean(thumbBusy)} className={`${btnDanger} ${btnSmall}`}>
                  <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                  Retirer la miniature
                </button>
              ) : null}
            </div>
            <p role="status" className="mt-3 text-sm text-muted empty:hidden">
              {thumbBusy ?? ""}
            </p>
            {thumbError ? (
              <p role="alert" className="mt-2 text-sm text-danger">
                {thumbError}
              </p>
            ) : null}
          </div>
        </div>
      </Panel>

      <Panel title="Photos">
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2.5 border border-dashed border-muted p-7 text-center text-muted transition-colors hover:border-teal hover:text-teal has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-teal ${uploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <ImagePlus size={24} strokeWidth={1.8} aria-hidden="true" />
          <span className="font-semibold text-text">Choisir des photos (plusieurs possibles)</span>
          <small className="text-sm">
            Réduites à {PHOTO_MAX_SIDE} px et compressées avant l’envoi. JPEG, PNG, WebP ou HEIC.
          </small>
          <input
            id={`${ns}-ph-choisir`}
            ref={photoInput}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(e) => choosePhotos(e.target.files)}
          />
        </label>

        {uploads.length > 0 ? (
          <div className="mt-4">
            <p role="status" className="mb-2 text-sm font-semibold">
              {uploading ? `Envoi des photos : ${doneCount} sur ${uploads.length}` : `Envoi terminé : ${doneCount} sur ${uploads.length}`}
            </p>
            <progress value={doneCount} max={uploads.length} className="mb-3 h-1.5 w-full accent-teal" aria-hidden="true" />
            <ul className="m-0 list-none p-0 text-sm">
              {uploads.map((u) => (
                <li key={u.key} className="flex flex-wrap gap-x-2 border-t border-line py-2 first:border-t-0">
                  <span className="min-w-0 break-all">{u.name}</span>
                  <span className={u.status === "erreur" ? "text-danger" : u.status === "fait" ? "text-teal" : "text-muted"}>
                    {STATUS_LABEL[u.status]}
                    {u.message ? ` : ${u.message}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {photos.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Aucune photo : le bloc est masqué sur la page du projet.</p>
        ) : (
          <ol className="m-0 mt-4 grid list-none grid-cols-1 gap-3.5 p-0 min-[560px]:grid-cols-2 min-[1000px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {photos.map((photo, i) => {
              const altId = `ph-${photo.id}-alt`;
              const altError = errors[`photos.${i}.alt`];
              const label = `la photo ${i + 1}`;
              return (
                <li key={photo.id} className="flex flex-col gap-2 border border-line bg-bg p-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-2">
                    <Image src={mediaUrl(photo.path)} alt="" fill unoptimized sizes="240px" className="object-cover" />
                  </div>
                  <label htmlFor={altId} className="text-sm text-muted">
                    Texte alternatif de la photo {i + 1} (facultatif)
                  </label>
                  <input
                    id={altId}
                    value={photo.alt}
                    maxLength={PROJECT_LIMITS.alt}
                    placeholder="Tournage en extérieur"
                    onChange={(e) => onPhotos((list) => list.map((p) => (p.id === photo.id ? { ...p, alt: e.target.value } : p)))}
                    className={`${inputClass} py-2.5 text-[15px]`}
                    {...errorProps(altId, altError)}
                  />
                  {altError ? (
                    <p id={`${altId}-erreur`} className="text-sm text-danger">
                      {altError}
                    </p>
                  ) : null}
                  {confirmPhoto === photo.id ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="w-full text-sm">Supprimer {label} ?</span>
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        disabled={busyPhoto === photo.id}
                        className={`${btnDanger} ${btnSmall}`}
                        autoFocus
                      >
                        {busyPhoto === photo.id ? "Suppression" : "Supprimer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmPhoto(null);
                          setFocusId(`ph-${photo.id}-remove`);
                        }}
                        className={`${btnLine} ${btnSmall}`}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        id={`ph-${photo.id}-up`}
                        type="button"
                        className={iconBtn}
                        onClick={() => movePhoto(i, -1)}
                        disabled={i === 0}
                        aria-label={`Placer ${label} avant`}
                      >
                        <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                      <button
                        id={`ph-${photo.id}-down`}
                        type="button"
                        className={iconBtn}
                        onClick={() => movePhoto(i, 1)}
                        disabled={i === photos.length - 1}
                        aria-label={`Placer ${label} après`}
                      >
                        <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                      <button
                        id={`ph-${photo.id}-remove`}
                        type="button"
                        className={iconBtnDanger}
                        onClick={() => setConfirmPhoto(photo.id)}
                        aria-label={`Supprimer ${label}`}
                      >
                        <Trash2 size={18} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        {photos.length > 1 ? (
          <p className="mt-3 text-sm text-muted">
            L’ordre et les textes alternatifs des photos sont enregistrés avec « Enregistrer le projet ».
          </p>
        ) : null}
      </Panel>
    </>
  );
}
