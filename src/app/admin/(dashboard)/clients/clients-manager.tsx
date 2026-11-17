"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import {
  addClient,
  deleteClient,
  discardClientUpload,
  removeClientLogo,
  renameClient,
  reorderClients,
  setClientLogo,
  setClientWhite,
  type AdminClient,
} from "@/app/admin/client-actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Field, errorProps, inputClass } from "@/components/admin/field";
import { ImageError, prepareImage, uploadImage } from "@/components/admin/image-upload";
import { Toast } from "@/components/admin/toast";
import { btnLine, btnSmall, btnSolid, iconBtn, iconBtnDanger } from "@/components/admin/ui";
import { useFocusLater } from "@/components/admin/use-focus-later";
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes";
import { stamped, type ActionState } from "@/lib/admin/action-state";
import { clientLogoPath, LOGO_MAX_SIDE } from "@/lib/admin/images";
import { moveItem } from "@/lib/admin/list";
import { CLIENT_NAME_MAX, clientSchema, validate } from "@/lib/admin/schemas";
import { mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

type Row = AdminClient & { draft: string; error?: string };

/** Lignes à partir des données du serveur, en gardant les noms en cours de saisie. */
function merge(server: AdminClient[], previous: Row[]): Row[] {
  const drafts = new Map(previous.map((r) => [r.id, r]));
  return server.map((c) => {
    const old = drafts.get(c.id);
    return { ...c, draft: old && old.draft !== old.name ? old.draft : c.name, error: old?.error };
  });
}

// Onglet Clients (cahier 7.3, prototype clientsTab) : chaque action est
// enregistrée aussitôt (ajout, nom, logo, affichage en blanc, ordre,
// suppression), le bandeau de l'accueil suit sans redéploiement.
export function ClientsManager({ initial }: { initial: AdminClient[] }) {
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
  const [newName, setNewName] = useState("");
  const [newError, setNewError] = useState<string | undefined>();
  const focusLater = useFocusLater();
  const fileInputs = useRef(new Map<string, HTMLInputElement | null>());

  const notify = (state: ActionState) => setToast(stamped(state));
  const patch = (rowId: string, values: Partial<Row>) =>
    setRows((list) => list.map((r) => (r.id === rowId ? { ...r, ...values } : r)));

  useUnsavedChanges(rows.some((r) => r.draft !== r.name) || newName.trim() !== "");

  function run(rowId: string, action: () => Promise<void>) {
    setBusy(rowId);
    startTransition(async () => {
      await action();
      setBusy(null);
    });
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const check = validate(clientSchema, { name: newName });
    if (!check.ok) {
      setNewError(check.errors.name);
      focusLater(`${ns}-nouveau`);
      return;
    }
    setNewError(undefined);
    run("nouveau", async () => {
      const result = await addClient({ name: newName });
      notify(result);
      if (result.client) {
        const created = result.client;
        setRows((list) => (list.some((r) => r.id === created.id) ? list : [...list, { ...created, draft: created.name }]));
        setNewName("");
        focusLater(`${ns}-logo-${created.id}`);
      } else if (result.errors?.name) {
        setNewError(result.errors.name);
      }
    });
  }

  function rename(row: Row) {
    const check = validate(clientSchema, { name: row.draft });
    if (!check.ok) {
      patch(row.id, { error: check.errors.name });
      focusLater(`${ns}-nom-${row.id}`);
      return;
    }
    run(row.id, async () => {
      const result = await renameClient(row.id, { name: row.draft });
      notify(result);
      if (result.status === "success") patch(row.id, { name: check.data.name, draft: check.data.name, error: undefined });
      else patch(row.id, { error: result.errors?.name });
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
      const result = await reorderClients(next.map((r) => r.id));
      if (result.status === "error") setRows(previous);
      notify(result);
    });
  }

  async function uploadLogo(row: Row, file: File | undefined) {
    const input = fileInputs.current.get(row.id);
    if (input) input.value = "";
    if (!file) return;
    setBusy(row.id);
    let path: string | null = null;
    try {
      const image = await prepareImage(file, { maxSide: LOGO_MAX_SIDE, fallback: "png" });
      path = clientLogoPath(row.id, crypto.randomUUID(), image.ext);
      await uploadImage(createClient(), path, image);
      const result = await setClientLogo(row.id, path);
      notify(result);
      if (result.status === "success" && result.path) patch(row.id, { logo_path: result.path });
    } catch (error) {
      if (path) await discardClientUpload(row.id, path).catch(() => undefined);
      notify({
        status: "error",
        message: error instanceof ImageError ? error.message : "L’envoi a échoué. Vérifiez la connexion et réessayez.",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {rows.length === 0 ? (
        <p className="mb-6 border border-dashed border-line p-12 text-center text-muted">Aucun client. Ajoutez le premier.</p>
      ) : (
        <ol className="m-0 mb-6 list-none border border-line bg-bg-2 px-[clamp(16px,3vw,32px)] py-2" aria-label="Clients dans l’ordre du bandeau">
          {rows.map((row, i) => {
            const nameId = `${ns}-nom-${row.id}`;
            const isBusy = busy === row.id;
            return (
              <li
                key={row.id}
                className="grid grid-cols-1 items-start gap-[18px] border-t border-line py-4 first:border-t-0 min-[760px]:grid-cols-[140px_minmax(0,1fr)_auto]"
              >
                <div className="grid h-[84px] w-[140px] place-items-center overflow-hidden border border-line bg-bg p-2.5">
                  {row.logo_path ? (
                    <Image
                      src={mediaUrl(row.logo_path)}
                      alt={`Logo de ${row.name}`}
                      width={120}
                      height={64}
                      unoptimized
                      className={`max-h-16 w-auto max-w-full object-contain ${row.logo_white ? "brightness-0 invert" : "grayscale"}`}
                    />
                  ) : (
                    <span className="text-center text-sm text-muted">Sans logo</span>
                  )}
                </div>

                <div className="min-w-0">
                  <Field id={nameId} label="Nom" error={row.error} className="!mb-2.5">
                    <div className="flex flex-wrap gap-2">
                      <input
                        id={nameId}
                        value={row.draft}
                        maxLength={CLIENT_NAME_MAX}
                        onChange={(e) => patch(row.id, { draft: e.target.value, error: undefined })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (row.draft !== row.name) rename(row);
                          }
                        }}
                        className={`${inputClass} min-w-0 flex-[1_1_200px]`}
                        {...errorProps(nameId, row.error)}
                      />
                      {row.draft !== row.name ? (
                        <button type="button" onClick={() => rename(row)} disabled={isBusy} className={`${btnSolid} ${btnSmall}`}>
                          Enregistrer le nom
                        </button>
                      ) : null}
                    </div>
                  </Field>
                  <p className="mb-2.5 text-sm text-muted">
                    {row.logo_path
                      ? row.logo_white
                        ? "Logo en ligne, affiché en blanc."
                        : "Logo en ligne, affiché en gris et en couleur au survol."
                      : "Sans logo : le nom est affiché en texte."}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      className={`${btnLine} ${btnSmall} cursor-pointer has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-teal ${isBusy ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <ImagePlus size={16} strokeWidth={1.8} aria-hidden="true" />
                      {row.logo_path ? "Changer le logo" : "Ajouter un logo"}
                      <span className="sr-only"> de {row.name}</span>
                      <input
                        id={`${ns}-logo-${row.id}`}
                        ref={(el) => {
                          fileInputs.current.set(row.id, el);
                        }}
                        type="file"
                        accept="image/png,image/webp,image/jpeg,image/avif"
                        className="sr-only"
                        disabled={isBusy}
                        onChange={(e) => uploadLogo(row, e.target.files?.[0])}
                      />
                    </label>
                    {row.logo_path ? (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          className={`${btnLine} ${btnSmall}`}
                          onClick={() =>
                            run(row.id, async () => {
                              const result = await removeClientLogo(row.id);
                              notify(result);
                              if (result.status === "success") {
                                patch(row.id, { logo_path: null });
                                focusLater(`${ns}-logo-${row.id}`);
                              }
                            })
                          }
                        >
                          Retirer le logo<span className="sr-only"> de {row.name}</span>
                        </button>
                        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 px-1 text-sm">
                          <input
                            type="checkbox"
                            checked={row.logo_white}
                            disabled={isBusy}
                            className="size-5 accent-teal"
                            onChange={(e) => {
                              const white = e.target.checked;
                              patch(row.id, { logo_white: white });
                              run(row.id, async () => {
                                const result = await setClientWhite(row.id, white);
                                notify(result);
                                if (result.status === "error") patch(row.id, { logo_white: !white });
                              });
                            }}
                          />
                          Afficher en blanc<span className="sr-only"> le logo de {row.name}</span>
                        </label>
                      </>
                    ) : null}
                    {isBusy ? (
                      <span role="status" className="text-sm text-muted">
                        Enregistrement en cours
                      </span>
                    ) : null}
                  </div>
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
                    question={`Supprimer « ${row.name} » du bandeau ? Son logo sera supprimé.`}
                    confirmLabel="Supprimer le client"
                    pending={isBusy}
                    triggerClassName={iconBtnDanger}
                    triggerLabel={`Supprimer ${row.name}`}
                    trigger={<Trash2 size={18} strokeWidth={1.8} aria-hidden="true" />}
                    onConfirm={() =>
                      run(row.id, async () => {
                        const result = await deleteClient(row.id);
                        notify(result);
                        if (result.status === "success") {
                          setRows((list) => list.filter((r) => r.id !== row.id));
                          focusLater(`${ns}-nouveau`);
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
        <h2 className="mb-[18px] text-lg tracking-[-0.01em]">Ajouter un client</h2>
        <Field id={`${ns}-nouveau`} label="Nom du client" error={newError}>
          <input
            id={`${ns}-nouveau`}
            value={newName}
            maxLength={CLIENT_NAME_MAX}
            onChange={(e) => {
              setNewName(e.target.value);
              setNewError(undefined);
            }}
            className={inputClass}
            {...errorProps(`${ns}-nouveau`, newError)}
          />
        </Field>
        <button type="submit" disabled={busy === "nouveau"} className={btnLine}>
          <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
          {busy === "nouveau" ? "Ajout en cours" : "Ajouter le client"}
        </button>
        <p className="mt-3 text-sm text-muted">Le logo s’ajoute ensuite sur la ligne du client.</p>
      </form>

      <Toast state={toast} />
    </>
  );
}
