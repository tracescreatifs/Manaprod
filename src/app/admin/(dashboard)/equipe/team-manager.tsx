"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import {
  addMember,
  deleteMember,
  discardMemberUpload,
  removeMemberPhoto,
  reorderMembers,
  setMemberPhoto,
  updateMember,
  type AdminMember,
} from "@/app/admin/team-actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Field, errorProps, inputClass } from "@/components/admin/field";
import { ImageError, prepareImage, uploadImage, type PreparedImage } from "@/components/admin/image-upload";
import { Toast } from "@/components/admin/toast";
import { btnLine, btnSmall, btnSolid, iconBtn, iconBtnDanger } from "@/components/admin/ui";
import { useFocusLater } from "@/components/admin/use-focus-later";
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes";
import { stamped, type ActionState } from "@/lib/admin/action-state";
import { teamPhotoPath, TEAM_PHOTO_RATIO, TEAM_PHOTO_WIDTH, type VerticalPosition } from "@/lib/admin/images";
import { moveItem } from "@/lib/admin/list";
import { TEAM_LIMITS, teamMemberSchema, validate, type FieldErrors } from "@/lib/admin/schemas";
import { initials } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

type Draft = { name: string; role: string; bio: string };
type Row = AdminMember & { draft: Draft; errors: FieldErrors };

const toDraft = (m: AdminMember): Draft => ({ name: m.name, role: m.role ?? "", bio: m.bio ?? "" });
const sameDraft = (a: Draft, b: Draft) => a.name === b.name && a.role === b.role && a.bio === b.bio;

function merge(server: AdminMember[], previous: Row[]): Row[] {
  const old = new Map(previous.map((r) => [r.id, r]));
  return server.map((m) => {
    const prev = old.get(m.id);
    const dirty = prev && !sameDraft(prev.draft, toDraft(prev));
    return { ...m, draft: dirty ? prev.draft : toDraft(m), errors: prev?.errors ?? {} };
  });
}

const POSITIONS: { value: VerticalPosition; label: string }[] = [
  { value: "haut", label: "Haut" },
  { value: "centre", label: "Centre" },
  { value: "bas", label: "Bas" },
];

// Onglet Équipe (cahier 7.4, prototype teamTab) : chaque membre est
// enregistré séparément ; la photo est recadrée en 4:5 dans le navigateur
// (position verticale au choix, aperçu exact), puis envoyée (D86).
export function TeamManager({ initial }: { initial: AdminMember[] }) {
  const ns = useId();
  const [rows, setRows] = useState<Row[]>(() => merge(initial, []));
  const [source, setSource] = useState(initial);
  if (initial !== source) {
    setSource(initial);
    setRows((previous) => merge(initial, previous));
  }
  const [toast, setToast] = useState<ActionState>({ status: "idle" });
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [fresh, setFresh] = useState<Draft>({ name: "", role: "", bio: "" });
  const [freshErrors, setFreshErrors] = useState<FieldErrors>({});
  const [cropFor, setCropFor] = useState<{ id: string; file: File } | null>(null);
  const focusLater = useFocusLater();

  const notify = (state: ActionState) => setToast(stamped(state));
  const patch = (rowId: string, values: Partial<Row>) =>
    setRows((list) => list.map((r) => (r.id === rowId ? { ...r, ...values } : r)));

  useUnsavedChanges(
    rows.some((r) => !sameDraft(r.draft, toDraft(r))) || fresh.name.trim() !== "" || cropFor !== null,
  );

  function run(rowId: string, action: () => Promise<void>) {
    setBusy(rowId);
    startTransition(async () => {
      await action();
      setBusy(null);
    });
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const check = validate(teamMemberSchema, fresh);
    if (!check.ok) {
      setFreshErrors(check.errors);
      focusLater(`${ns}-nouveau-name`);
      return;
    }
    setFreshErrors({});
    run("nouveau", async () => {
      const result = await addMember(fresh);
      notify(result);
      if (result.member) {
        const created = result.member;
        setRows((list) =>
          list.some((r) => r.id === created.id) ? list : [...list, { ...created, draft: toDraft(created), errors: {} }],
        );
        setFresh({ name: "", role: "", bio: "" });
        focusLater(`${ns}-photo-${created.id}`);
      } else if (result.errors) {
        setFreshErrors(result.errors);
      }
    });
  }

  function save(row: Row) {
    const check = validate(teamMemberSchema, row.draft);
    if (!check.ok) {
      patch(row.id, { errors: check.errors });
      focusLater(`${ns}-${Object.keys(check.errors)[0]}-${row.id}`);
      return;
    }
    run(row.id, async () => {
      const result = await updateMember(row.id, row.draft);
      notify(result);
      if (result.status === "success") {
        const saved = check.data;
        patch(row.id, { ...saved, draft: toDraft({ ...row, ...saved }), errors: {} });
      } else {
        patch(row.id, { errors: result.errors ?? {} });
      }
    });
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
      const result = await reorderMembers(next.map((r) => r.id));
      if (result.status === "error") setRows(previous);
      notify(result);
    });
  }

  async function sendPhoto(row: Row, image: PreparedImage) {
    setBusy(row.id);
    let path: string | null = null;
    try {
      path = teamPhotoPath(row.id, crypto.randomUUID(), image.ext);
      await uploadImage(createClient(), path, image);
      const result = await setMemberPhoto(row.id, path);
      notify(result);
      if (result.status === "success" && result.path) {
        patch(row.id, { photo_path: result.path });
        setCropFor(null);
        focusLater(`${ns}-photo-${row.id}`);
      }
    } catch (error) {
      if (path) await discardMemberUpload(row.id, path).catch(() => undefined);
      notify({
        status: "error",
        message: error instanceof ImageError ? error.message : "L’envoi a échoué. Vérifiez la connexion et réessayez.",
      });
    } finally {
      setBusy(null);
    }
  }

  const field = (row: Row, key: keyof Draft, label: string, max: number, multiline = false) => {
    const fieldId = `${ns}-${key}-${row.id}`;
    const error = row.errors[key];
    const onChange = (value: string) =>
      patch(row.id, { draft: { ...row.draft, [key]: value }, errors: { ...row.errors, [key]: "" } });
    return (
      <Field id={fieldId} label={label} error={error || undefined} className="!mb-3">
        {multiline ? (
          <textarea
            id={fieldId}
            rows={2}
            value={row.draft[key]}
            maxLength={max}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} min-h-[70px] resize-y`}
            {...(error ? { "aria-invalid": true, "aria-describedby": `${fieldId}-erreur` } : {})}
          />
        ) : (
          <input
            id={fieldId}
            value={row.draft[key]}
            maxLength={max}
            placeholder={key === "role" ? "Ex : Cadreur, Monteuse, Chef de projet" : undefined}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            {...errorProps(fieldId, error || undefined)}
          />
        )}
      </Field>
    );
  };

  return (
    <>
      {rows.length === 0 ? (
        <p className="mb-6 border border-dashed border-line p-12 text-center text-muted">Aucun membre. Ajoutez le premier.</p>
      ) : (
        <ol className="m-0 mb-6 list-none border border-line bg-bg-2 px-[clamp(16px,3vw,32px)] py-2" aria-label="Membres dans l’ordre de la page Le studio">
          {rows.map((row, i) => {
            const isBusy = busy === row.id;
            const dirty = !sameDraft(row.draft, toDraft(row));
            return (
              <li
                key={row.id}
                className="grid grid-cols-1 items-start gap-[18px] border-t border-line py-4 first:border-t-0 min-[760px]:grid-cols-[140px_minmax(0,1fr)_auto]"
              >
                <div className="relative aspect-[4/5] w-[140px] overflow-hidden border border-line bg-bg">
                  {row.photo_path ? (
                    <Image src={mediaUrl(row.photo_path)} alt={`Photo de ${row.name}`} fill unoptimized sizes="140px" className="object-cover" />
                  ) : (
                    <div aria-hidden="true" className="grid size-full place-items-center bg-bg-3 text-[32px] font-extrabold text-muted">
                      {initials(row.name)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="grid grid-cols-1 gap-x-5 min-[1000px]:grid-cols-2">
                    {field(row, "name", "Nom", TEAM_LIMITS.name)}
                    {field(row, "role", "Titre", TEAM_LIMITS.role)}
                  </div>
                  {field(row, "bio", "Présentation (facultative)", TEAM_LIMITS.bio, true)}
                  <div className="flex flex-wrap items-center gap-2">
                    {dirty ? (
                      <button type="button" onClick={() => save(row)} disabled={isBusy} className={`${btnSolid} ${btnSmall}`}>
                        Enregistrer<span className="sr-only"> {row.name}</span>
                      </button>
                    ) : null}
                    <label
                      className={`${btnLine} ${btnSmall} cursor-pointer has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-teal ${isBusy ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <ImagePlus size={16} strokeWidth={1.8} aria-hidden="true" />
                      {row.photo_path ? "Changer la photo" : "Ajouter une photo"}
                      <span className="sr-only"> de {row.name}</span>
                      <input
                        id={`${ns}-photo-${row.id}`}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={isBusy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) setCropFor({ id: row.id, file });
                        }}
                      />
                    </label>
                    {row.photo_path ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        className={`${btnLine} ${btnSmall}`}
                        onClick={() =>
                          run(row.id, async () => {
                            const result = await removeMemberPhoto(row.id);
                            notify(result);
                            if (result.status === "success") {
                              patch(row.id, { photo_path: null });
                              focusLater(`${ns}-photo-${row.id}`);
                            }
                          })
                        }
                      >
                        Retirer la photo<span className="sr-only"> de {row.name}</span>
                      </button>
                    ) : null}
                    {isBusy ? (
                      <span role="status" className="text-sm text-muted">
                        Enregistrement en cours
                      </span>
                    ) : null}
                  </div>
                  {cropFor?.id === row.id ? (
                    <PhotoCrop
                      key={`${cropFor.file.name}-${cropFor.file.lastModified}`}
                      file={cropFor.file}
                      name={row.name}
                      busy={isBusy}
                      onCancel={() => {
                        setCropFor(null);
                        focusLater(`${ns}-photo-${row.id}`);
                      }}
                      onConfirm={(image) => sendPhoto(row, image)}
                      onError={(message) => {
                        setCropFor(null);
                        notify({ status: "error", message });
                        focusLater(`${ns}-photo-${row.id}`);
                      }}
                    />
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-1.5 min-[760px]:justify-end">
                  <button
                    id={`${ns}-monter-${row.id}`}
                    type="button"
                    className={iconBtn}
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Monter ${row.name}`}
                  >
                    <ArrowUp size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <button
                    id={`${ns}-descendre-${row.id}`}
                    type="button"
                    className={iconBtn}
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    aria-label={`Descendre ${row.name}`}
                  >
                    <ArrowDown size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  <ConfirmButton
                    question={`Supprimer « ${row.name} » de l’équipe ? Sa photo sera supprimée.`}
                    confirmLabel="Supprimer le membre"
                    pending={isBusy}
                    triggerClassName={iconBtnDanger}
                    triggerLabel={`Supprimer ${row.name}`}
                    trigger={<Trash2 size={18} strokeWidth={1.8} aria-hidden="true" />}
                    onConfirm={() =>
                      run(row.id, async () => {
                        const result = await deleteMember(row.id);
                        notify(result);
                        if (result.status === "success") {
                          setRows((list) => list.filter((r) => r.id !== row.id));
                          focusLater(`${ns}-nouveau-name`);
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

      <form onSubmit={add} noValidate className="mb-6 border border-line bg-bg-2 p-[clamp(20px,3vw,32px)]">
        <h2 className="mb-[18px] text-lg tracking-[-0.01em]">Ajouter un membre</h2>
        <div className="grid grid-cols-1 gap-x-5 min-[1000px]:grid-cols-2">
          {(["name", "role"] as const).map((key) => {
            const fieldId = `${ns}-nouveau-${key}`;
            return (
              <Field key={key} id={fieldId} label={key === "name" ? "Nom" : "Titre (facultatif)"} error={freshErrors[key]}>
                <input
                  id={fieldId}
                  value={fresh[key]}
                  maxLength={TEAM_LIMITS[key]}
                  onChange={(e) => {
                    setFresh((f) => ({ ...f, [key]: e.target.value }));
                    setFreshErrors((errs) => ({ ...errs, [key]: "" }));
                  }}
                  className={inputClass}
                  {...errorProps(fieldId, freshErrors[key] || undefined)}
                />
              </Field>
            );
          })}
        </div>
        <button type="submit" disabled={busy === "nouveau"} className={btnLine}>
          <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
          {busy === "nouveau" ? "Ajout en cours" : "Ajouter le membre"}
        </button>
        <p className="mt-3 text-sm text-muted">La photo et la présentation s’ajoutent ensuite sur la ligne du membre.</p>
      </form>

      <Toast state={toast} />
    </>
  );
}

/**
 * Recadrage d'une photo au format 4:5 : position verticale du cadre au
 * choix, aperçu de l'image exacte qui sera envoyée (1000 px de large).
 */
function PhotoCrop({
  file,
  name,
  busy,
  onCancel,
  onConfirm,
  onError,
}: {
  file: File;
  name: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (image: PreparedImage) => void;
  onError: (message: string) => void;
}) {
  const ns = useId();
  const [position, setPosition] = useState<VerticalPosition>("centre");
  const [prepared, setPrepared] = useState<{ position: VerticalPosition; image: PreparedImage; url: string } | null>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    prepareImage(file, { maxWidth: TEAM_PHOTO_WIDTH, crop: { ratio: TEAM_PHOTO_RATIO, position }, fallback: "jpeg" })
      .then((image) => {
        if (cancelled) return;
        url = URL.createObjectURL(image.blob);
        setPrepared({ position, image, url });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          onErrorRef.current(error instanceof ImageError ? error.message : "Cette image n’a pas pu être préparée.");
        }
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file, position]);

  const ready = prepared?.position === position ? prepared : null;

  return (
    <div role="group" aria-labelledby={`${ns}-titre`} className="mt-4 border border-line bg-bg p-4">
      <p id={`${ns}-titre`} className="mb-3 font-semibold">
        Recadrage de la photo de {name} (format 4:5)
      </p>
      <div className="flex flex-wrap items-start gap-5">
        <div className="relative aspect-[4/5] w-[160px] overflow-hidden border border-line bg-bg-2">
          {prepared ? (
            // Aperçu local (adresse blob:) de l'image exacte qui sera envoyée.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={prepared.url} alt={`Aperçu recadré de la photo de ${name}`} className="size-full object-cover" />
          ) : null}
          {!ready ? (
            <span role="status" className="absolute inset-0 grid place-items-center bg-bg/70 text-sm text-muted">
              Préparation
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-[1_1_200px]">
          <fieldset className="mb-4 border-0 p-0">
            <legend className="mb-2 text-sm font-medium text-muted">Position du cadrage</legend>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((p) => (
                <label
                  key={p.value}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 border px-3.5 text-sm has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-teal ${
                    position === p.value ? "border-teal text-teal" : "border-line text-text"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${ns}-position`}
                    value={p.value}
                    checked={position === p.value}
                    onChange={() => setPosition(p.value)}
                    className="accent-teal"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mb-4 text-sm text-muted">
            La photo est recadrée au centre en largeur. Choisissez la hauteur du cadre pour garder le visage.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!ready || busy}
              onClick={() => ready && onConfirm(ready.image)}
              className={`${btnSolid} ${btnSmall}`}
            >
              {busy ? "Envoi en cours" : "Enregistrer la photo"}
            </button>
            <button type="button" disabled={busy} onClick={onCancel} className={`${btnLine} ${btnSmall}`}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
