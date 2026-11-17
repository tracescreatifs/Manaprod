"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import {
  addBackstagePhotos,
  deleteBackstagePhoto,
  discardBackstageUploads,
  reorderBackstage,
  updateBackstageAlt,
  type SavedBackstagePhoto,
} from "@/app/admin/studio-actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { errorProps, inputClass } from "@/components/admin/field";
import { ImageError, prepareImage, uploadImage } from "@/components/admin/image-upload";
import { Toast } from "@/components/admin/toast";
import { btnSmall, btnSolid, iconBtn, iconBtnDanger } from "@/components/admin/ui";
import { useFocusLater } from "@/components/admin/use-focus-later";
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes";
import { stamped, type ActionState } from "@/lib/admin/action-state";
import { backstagePath, PHOTO_MAX_SIDE } from "@/lib/admin/images";
import { moveItem } from "@/lib/admin/list";
import { BACKSTAGE_LIMITS, backstageAltSchema, validate } from "@/lib/admin/schemas";
import { mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

type Row = SavedBackstagePhoto & { draft: string; error?: string };
type UploadItem = { key: string; name: string; status: "attente" | "preparation" | "envoi" | "fait" | "erreur"; message?: string };

const STATUS_LABEL: Record<UploadItem["status"], string> = {
  attente: "En attente",
  preparation: "Compression",
  envoi: "Envoi en cours",
  fait: "Ajoutée",
  erreur: "Échec",
};

const toRow = (p: SavedBackstagePhoto, previous?: Row): Row => ({
  ...p,
  draft: previous && previous.draft !== (previous.alt ?? "") ? previous.draft : (p.alt ?? ""),
  error: previous?.error,
});

// Onglet Coulisses (D99) : téléversement direct vers media/backstage/,
// texte alternatif, ordre, suppression en deux temps. Chaque action est
// enregistrée aussitôt et la page Le studio suit sans redéploiement.
export function BackstageManager({ initial }: { initial: SavedBackstagePhoto[] }) {
  const ns = useId();
  const [rows, setRows] = useState<Row[]>(() => initial.map((p) => toRow(p)));
  const [source, setSource] = useState(initial);
  if (initial !== source) {
    setSource(initial);
    setRows((previous) => initial.map((p) => toRow(p, previous.find((r) => r.id === p.id))));
  }
  const [toast, setToast] = useState<ActionState>({ status: "idle" });
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const focusLater = useFocusLater();
  const uploading = uploads.some((u) => u.status !== "fait" && u.status !== "erreur");

  const notify = (state: ActionState) => setToast(stamped(state));
  const patch = (rowId: string, values: Partial<Row>) =>
    setRows((list) => list.map((r) => (r.id === rowId ? { ...r, ...values } : r)));

  useUnsavedChanges(rows.some((r) => r.draft !== (r.alt ?? "")));

  function run(rowId: string, action: () => Promise<void>) {
    setBusy(rowId);
    startTransition(async () => {
      await action();
      setBusy(null);
    });
  }

  async function choose(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (input.current) input.current.value = "";
    if (files.length === 0) return;
    const accepted = files.slice(0, Math.max(0, BACKSTAGE_LIMITS.photos - rows.length));
    const items: UploadItem[] = accepted.map((f) => ({ key: crypto.randomUUID(), name: f.name, status: "attente" }));
    setUploads(items);
    const update = (key: string, values: Partial<UploadItem>) =>
      setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...values } : u)));
    const supabase = createClient();
    let added = 0;
    for (const [i, file] of accepted.entries()) {
      const key = items[i].key;
      let path: string | null = null;
      try {
        update(key, { status: "preparation" });
        const image = await prepareImage(file, PHOTO_MAX_SIDE);
        path = backstagePath(crypto.randomUUID(), image.ext);
        update(key, { status: "envoi" });
        await uploadImage(supabase, path, image);
        const result = await addBackstagePhotos([{ path, width: image.width, height: image.height }]);
        if (result.status === "error" || !result.photos) {
          update(key, { status: "erreur", message: result.message });
          continue;
        }
        const saved = result.photos;
        setRows((list) => [...list, ...saved.filter((p) => !list.some((r) => r.id === p.id)).map((p) => toRow(p))]);
        update(key, { status: "fait" });
        added += saved.length;
      } catch (error) {
        if (path) await discardBackstageUploads([path]).catch(() => undefined);
        update(key, {
          status: "erreur",
          message: error instanceof ImageError ? error.message : "L’envoi a échoué. Vérifiez la connexion et réessayez.",
        });
      }
    }
    const skipped = files.length - accepted.length;
    const failed = accepted.length - added;
    notify(
      failed === 0 && skipped === 0
        ? { status: "success", message: added > 1 ? `${added} photos ajoutées.` : "Photo ajoutée." }
        : {
            status: "error",
            message:
              `${added} photo${added > 1 ? "s" : ""} ajoutée${added > 1 ? "s" : ""}, ${failed + skipped} non ajoutée${failed + skipped > 1 ? "s" : ""}.` +
              (skipped ? ` Limite de ${BACKSTAGE_LIMITS.photos} photos atteinte.` : " Voir le détail sous le bouton."),
          },
    );
  }

  function move(index: number, delta: number) {
    if (pending) return;
    const previous = rows;
    const next = moveItem(rows, index, delta);
    const moved = rows[index];
    const newIndex = index + delta;
    const canContinue = delta < 0 ? newIndex > 0 : newIndex < next.length - 1;
    setRows(next);
    focusLater(`${ns}-${canContinue === delta < 0 ? "monter" : "descendre"}-${moved.id}`);
    run(moved.id, async () => {
      const result = await reorderBackstage(next.map((r) => r.id));
      if (result.status === "error") setRows(previous);
      notify(result);
    });
  }

  function saveAlt(row: Row) {
    const check = validate(backstageAltSchema, { alt: row.draft });
    if (!check.ok) {
      patch(row.id, { error: check.errors.alt });
      focusLater(`${ns}-alt-${row.id}`);
      return;
    }
    run(row.id, async () => {
      const result = await updateBackstageAlt(row.id, { alt: row.draft });
      notify(result);
      if (result.status === "success") patch(row.id, { alt: check.data.alt, draft: check.data.alt ?? "", error: undefined });
      else patch(row.id, { error: result.errors?.alt });
    });
  }

  const done = uploads.filter((u) => u.status === "fait" || u.status === "erreur").length;

  return (
    <>
      <section className="mb-6 border border-line bg-bg-2 p-[clamp(20px,3vw,32px)]">
        <h2 className="mb-[18px] text-lg tracking-[-0.01em]">Ajouter des photos</h2>
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2.5 border border-dashed border-muted p-7 text-center text-muted transition-colors hover:border-teal hover:text-teal has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-teal ${uploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <ImagePlus size={24} strokeWidth={1.8} aria-hidden="true" />
          <span className="font-semibold text-text">Choisir des photos (plusieurs possibles)</span>
          <small className="text-sm">Réduites à {PHOTO_MAX_SIDE} px et compressées avant l’envoi. JPEG, PNG, WebP ou HEIC.</small>
          <input
            id={`${ns}-choisir`}
            ref={input}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(e) => choose(e.target.files)}
          />
        </label>
        {uploads.length > 0 ? (
          <div className="mt-4">
            <p role="status" className="mb-2 text-sm font-semibold">
              {uploading ? `Envoi des photos : ${done} sur ${uploads.length}` : `Envoi terminé : ${done} sur ${uploads.length}`}
            </p>
            <progress value={done} max={uploads.length} className="mb-3 h-1.5 w-full accent-teal" aria-hidden="true" />
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
      </section>

      {rows.length === 0 ? (
        <p className="mb-6 border border-dashed border-line p-12 text-center text-muted">
          Aucune photo : la section « Dans les coulisses » est masquée sur le site.
        </p>
      ) : (
        <ol className="m-0 mb-6 list-none border border-line bg-bg-2 px-[clamp(16px,3vw,32px)] py-2" aria-label="Photos dans l’ordre de la page">
          {rows.map((row, i) => {
            const altId = `${ns}-alt-${row.id}`;
            const isBusy = busy === row.id;
            const label = `la photo ${i + 1}`;
            return (
              <li
                key={row.id}
                className="grid grid-cols-1 items-start gap-[18px] border-t border-line py-4 first:border-t-0 min-[760px]:grid-cols-[160px_minmax(0,1fr)_auto]"
              >
                <div className="relative aspect-[4/3] w-[160px] max-w-full overflow-hidden border border-line bg-bg">
                  <Image src={mediaUrl(row.storage_path)} alt="" fill unoptimized sizes="160px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <label htmlFor={altId} className="mb-2 block text-sm font-medium text-muted">
                    Texte alternatif de la photo {i + 1} (facultatif)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      id={altId}
                      value={row.draft}
                      maxLength={BACKSTAGE_LIMITS.alt}
                      placeholder="Tournage en extérieur"
                      onChange={(e) => patch(row.id, { draft: e.target.value, error: undefined })}
                      className={`${inputClass} min-w-0 flex-[1_1_220px]`}
                      {...errorProps(altId, row.error)}
                    />
                    {row.draft !== (row.alt ?? "") ? (
                      <button type="button" onClick={() => saveAlt(row)} disabled={isBusy} className={`${btnSolid} ${btnSmall}`}>
                        Enregistrer le texte
                      </button>
                    ) : null}
                  </div>
                  {row.error ? (
                    <p id={`${altId}-erreur`} className="mt-2 text-sm text-danger">
                      {row.error}
                    </p>
                  ) : null}
                  {isBusy ? (
                    <p role="status" className="mt-2 text-sm text-muted">
                      Enregistrement en cours
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5 min-[760px]:justify-end">
                  <button
                    id={`${ns}-monter-${row.id}`}
                    type="button"
                    className={iconBtn}
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Monter ${label}`}
                  >
                    <ArrowUp size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <button
                    id={`${ns}-descendre-${row.id}`}
                    type="button"
                    className={iconBtn}
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    aria-label={`Descendre ${label}`}
                  >
                    <ArrowDown size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <ConfirmButton
                    question={`Supprimer ${label} des coulisses ? Le fichier sera supprimé.`}
                    confirmLabel="Supprimer la photo"
                    pending={isBusy}
                    triggerClassName={iconBtnDanger}
                    triggerLabel={`Supprimer ${label}`}
                    trigger={<Trash2 size={18} strokeWidth={1.8} aria-hidden="true" />}
                    onConfirm={() =>
                      run(row.id, async () => {
                        const result = await deleteBackstagePhoto(row.id);
                        notify(result);
                        if (result.status === "success") {
                          const rest = rows.filter((r) => r.id !== row.id);
                          setRows(rest);
                          const neighbour = rest[Math.min(i, rest.length - 1)];
                          focusLater(neighbour ? `${ns}-alt-${neighbour.id}` : `${ns}-choisir`);
                        }
                      })
                    }
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <Toast state={toast} />
    </>
  );
}
