"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { createProject, deleteProject, updateProject } from "@/app/admin/project-actions";
import { Field, errorProps, inputClass } from "@/components/admin/field";
import { Panel } from "@/components/admin/page-head";
import { Toast } from "@/components/admin/toast";
import { btnDanger, btnLine, btnSmall, btnSolid, iconBtn, iconBtnDanger } from "@/components/admin/ui";
import { useFocusLater } from "@/components/admin/use-focus-later";
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes";
import type { ActionState } from "@/lib/admin/action-state";
import { moveItem } from "@/lib/admin/list";
import type { AdminProject } from "@/lib/admin/projects";
import { PROJECT_LIMITS, projectSchema, projectYearMax, validate, type FieldErrors } from "@/lib/admin/schemas";
import { projectSlug, SLUG_MAX } from "@/lib/admin/slug";
import { extractYouTubeId, youTubeThumbnailUrl } from "@/lib/youtube";
import { PROJECT_CATEGORIES } from "@/types/database";
import { ProjectMedia, type PhotoRow } from "./project-media";

type LineRow = { key: number; value: string };
type VideoRow = { key: number; id?: string; url: string; title: string };

type Values = {
  client: string;
  title: string;
  slug: string;
  category: string;
  year: string;
  description: string;
  deliverables: LineRow[];
  featured: boolean;
  published: boolean;
  videos: VideoRow[];
  photos: PhotoRow[];
};

/** Données envoyées à la Server Action (sans les clés d'affichage). */
function payload(v: Values) {
  return {
    client: v.client,
    title: v.title,
    slug: v.slug,
    category: v.category,
    year: v.year,
    description: v.description,
    deliverables: v.deliverables.map((d) => d.value),
    featured: v.featured,
    published: v.published,
    videos: v.videos.map(({ id, url, title }) => ({ id, url, title })),
    photos: v.photos.map(({ id, alt }) => ({ id, alt })),
  };
}

const FIX_FIELDS = "Certains champs sont à corriger.";

let keySeed = 0;
const nextKey = () => ++keySeed;

function initialValues(project: AdminProject | null): Values {
  if (!project) {
    return {
      client: "",
      title: "",
      slug: "",
      category: PROJECT_CATEGORIES[0],
      year: String(new Date().getFullYear()),
      description: "",
      deliverables: [],
      featured: false,
      published: false,
      videos: [],
      photos: [],
    };
  }
  return {
    client: project.client,
    title: project.title,
    slug: project.slug,
    category: project.category,
    year: project.year ? String(project.year) : "",
    description: project.description ?? "",
    deliverables: project.deliverables.map((value) => ({ key: nextKey(), value })),
    featured: project.featured,
    published: project.published,
    videos: project.videos.map((v) => ({ key: nextKey(), id: v.id, url: v.youtube_url, title: v.title ?? "" })),
    photos: project.photos.map((p) => ({
      id: p.id,
      path: p.storage_path,
      alt: p.alt ?? "",
      width: p.width,
      height: p.height,
    })),
  };
}

/** Erreur immédiate d'un lien de vidéo : non reconnu, ou déjà présent plus haut. */
function liveVideoError(videos: VideoRow[], index: number): string | undefined {
  const url = videos[index].url.trim();
  if (!url) return undefined;
  const id = extractYouTubeId(url);
  if (!id) return "Ce lien n’est pas reconnu comme une vidéo YouTube.";
  const first = videos.findIndex((v) => extractYouTubeId(v.url.trim()) === id);
  if (first < index) return `Cette vidéo est déjà dans la liste (vidéo ${first + 1}).`;
  return undefined;
}

// Éditeur d'un projet (cahier 7.2, prototype editorHTML) : création et
// modification. Informations, livrables, vidéos et ordre/texte des photos
// sont enregistrés par « Enregistrer le projet » ; la miniature et les
// photos sont envoyées et enregistrées dès leur choix (D78).
export function ProjectEditor({ project }: { project: AdminProject | null }) {
  const router = useRouter();
  // Préfixe propre à cette instance : identifiants uniques même quand le
  // routeur garde plusieurs éditeurs en mémoire (pages masquées).
  const ns = useId();
  const projectId = project?.id ?? null;
  const [values, setValues] = useState<Values>(() => initialValues(project));
  const [saved, setSaved] = useState(() => JSON.stringify(payload(initialValues(project))));
  const [savedSlug, setSavedSlug] = useState(project?.slug ?? null);
  const [savedPublished, setSavedPublished] = useState(project?.published ?? false);
  const [thumbnailPath, setThumbnailPath] = useState(project?.thumbnail_path ?? null);
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ActionState>({ status: "idle" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const setFocusId = useFocusLater();
  const formRef = useRef<HTMLFormElement>(null);

  const dirty = JSON.stringify(payload(values)) !== saved;
  useUnsavedChanges(dirty);


  const notify = (state: ActionState) => setToast({ ...state, at: Date.now() });

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  function setIdentity(key: "client" | "title", value: string) {
    setValues((v) => {
      const next = { ...v, [key]: value };
      // Nouveau projet : l'adresse suit le client et le titre tant qu'elle
      // n'a pas été modifiée à la main.
      if (!slugTouched) next.slug = projectSlug(next.client, next.title);
      return next;
    });
  }

  // Listes : livrables et vidéos (ajout, retrait, déplacement, focus suivi).
  function addDeliverable() {
    const key = nextKey();
    set("deliverables", [...values.deliverables, { key, value: "" }]);
    setFocusId(`dl-${key}`);
  }
  function addVideo() {
    const key = nextKey();
    set("videos", [...values.videos, { key, url: "", title: "" }]);
    setFocusId(`v-url-${key}`);
  }
  function moveRow(list: "deliverables" | "videos", index: number, delta: number, prefix: string) {
    const rows = values[list] as { key: number }[];
    const moved = rows[index];
    const next = moveItem(rows, index, delta);
    const newIndex = index + delta;
    const canContinue = delta < 0 ? newIndex > 0 : newIndex < next.length - 1;
    setValues((v) => ({ ...v, [list]: next }));
    setErrors({});
    setFocusId(`${prefix}-${moved.key}-${canContinue === delta < 0 ? "up" : "down"}`);
  }
  function removeRow(list: "deliverables" | "videos", index: number, addButtonId: string, prefix: string) {
    const rows = values[list] as { key: number }[];
    const next = rows.filter((_, i) => i !== index);
    setValues((v) => ({ ...v, [list]: next }));
    setErrors({});
    const neighbour = next[Math.min(index, next.length - 1)];
    setFocusId(neighbour ? `${prefix}-${neighbour.key}-remove` : addButtonId);
  }

  function save() {
    const data = payload(values);
    const check = validate(projectSchema, data);
    if (!check.ok) {
      setErrors(check.errors);
      notify({ status: "error", message: FIX_FIELDS });
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setErrors({});
    startSaving(async () => {
      const result = projectId ? await updateProject(projectId, data) : await createProject(data);
      if (result.status === "error") {
        setErrors(result.errors ?? {});
        notify(result);
        if (result.errors) {
          requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        }
        return;
      }
      setSaved(JSON.stringify(data));
      setSavedSlug(values.slug);
      setSavedPublished(values.published);
      if (!projectId && result.id) {
        // Formulaire vidé avant de quitter : la page « Nouveau projet »,
        // gardée en mémoire par le routeur, repart toujours d'une page vierge.
        const blank = initialValues(null);
        setValues(blank);
        setSaved(JSON.stringify(payload(blank)));
        setSlugTouched(false);
        router.replace(`/admin/projets/${result.id}?notification=cree`);
        return;
      }
      notify(result);
    });
  }

  function remove() {
    if (!projectId) return;
    startDeleting(async () => {
      const result = await deleteProject(projectId);
      if (result.status === "error") {
        notify(result);
        return;
      }
      setSaved(JSON.stringify(payload(values)));
      router.replace("/admin/projets?notification=supprime");
    });
  }

  const name = `${values.client || "Client"} : ${values.title || "Titre"}`;
  const firstVideoId = values.videos.map((v) => extractYouTubeId(v.url.trim())).find(Boolean) ?? null;
  const slugChanged = Boolean(project && savedPublished && savedSlug && values.slug !== savedSlug);
  const yearMax = projectYearMax();

  return (
    <>
      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <Panel title="Informations">
          <div className="grid grid-cols-1 gap-x-5 min-[1000px]:grid-cols-2">
            <Field id={`${ns}-f-client`} label="Client" error={errors.client}>
              <input
                id={`${ns}-f-client`}
                value={values.client}
                maxLength={PROJECT_LIMITS.client}
                onChange={(e) => setIdentity("client", e.target.value)}
                className={inputClass}
                required
                {...errorProps(`${ns}-f-client`, errors.client)}
              />
            </Field>
            <Field id={`${ns}-f-title`} label="Titre du projet" error={errors.title}>
              <input
                id={`${ns}-f-title`}
                value={values.title}
                maxLength={PROJECT_LIMITS.title}
                onChange={(e) => setIdentity("title", e.target.value)}
                className={inputClass}
                required
                {...errorProps(`${ns}-f-title`, errors.title)}
              />
            </Field>
            <Field id={`${ns}-f-cat`} label="Catégorie" error={errors.category}>
              <select
                id={`${ns}-f-cat`}
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
                className={`${inputClass} appearance-none`}
                {...(errors.category ? { "aria-invalid": true, "aria-describedby": `${ns}-f-cat-erreur` } : {})}
              >
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field id={`${ns}-f-year`} label="Année (facultative)" error={errors.year}>
              <input
                id={`${ns}-f-year`}
                type="number"
                inputMode="numeric"
                min={PROJECT_LIMITS.yearMin}
                max={yearMax}
                value={values.year}
                onChange={(e) => set("year", e.target.value)}
                className={inputClass}
                {...errorProps(`${ns}-f-year`, errors.year)}
              />
            </Field>
          </div>
          <Field
            id={`${ns}-f-slug`}
            label="Adresse de la page"
            error={errors.slug}
            hint={
              <>
                La page sera à l’adresse /realisations/{values.slug || "…"}. Lettres minuscules sans accent, chiffres et
                tirets.
                {slugChanged ? (
                  <span className="mt-1 block text-danger">
                    Attention : le projet est publié, l’ancien lien (/realisations/{savedSlug}) ne fonctionnera plus.
                  </span>
                ) : null}
              </>
            }
          >
            <input
              id={`${ns}-f-slug`}
              value={values.slug}
              maxLength={SLUG_MAX}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              className={inputClass}
              required
              {...errorProps(`${ns}-f-slug`, errors.slug)}
            />
          </Field>
          <Field
            id={`${ns}-f-desc`}
            label="Description (facultative)"
            hint="Séparez les paragraphes par une ligne vide."
            error={errors.description}
          >
            <textarea
              id={`${ns}-f-desc`}
              rows={5}
              value={values.description}
              maxLength={PROJECT_LIMITS.description}
              placeholder="Contexte, objectif, résultat..."
              onChange={(e) => set("description", e.target.value)}
              className={`${inputClass} min-h-[130px] resize-y`}
              {...(errors.description ? { "aria-invalid": true, "aria-describedby": `${ns}-f-desc-erreur` } : {})}
            />
          </Field>
          <div className="flex flex-col gap-1">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="size-5 accent-teal"
              />
              Afficher dans la sélection de l’accueil
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
              <input
                type="checkbox"
                checked={values.published}
                onChange={(e) => set("published", e.target.checked)}
                className="size-5 accent-teal"
              />
              Publié (visible sur le site)
            </label>
          </div>
        </Panel>

        <Panel title="Livrables">
          {values.deliverables.length === 0 ? (
            <p className="mb-4 text-sm text-muted">Aucun livrable : le bloc est masqué sur la page du projet.</p>
          ) : (
            <ol className="m-0 mb-4 list-none p-0">
              {values.deliverables.map((row, i) => {
                const id = `dl-${row.key}`;
                const error = errors[`deliverables.${i}`];
                return (
                  <li key={row.key} className="flex items-start gap-1.5 border-t border-line py-3 first:border-t-0 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <label htmlFor={id} className="sr-only">
                        Livrable {i + 1}
                      </label>
                      <input
                        id={id}
                        value={row.value}
                        maxLength={PROJECT_LIMITS.deliverable}
                        placeholder="Film de 3 min"
                        onChange={(e) =>
                          set(
                            "deliverables",
                            values.deliverables.map((d) => (d.key === row.key ? { ...d, value: e.target.value } : d)),
                          )
                        }
                        className={inputClass}
                        {...errorProps(id, error)}
                      />
                      {error ? (
                        <p id={`${id}-erreur`} className="mt-1 text-sm text-danger">
                          {error}
                        </p>
                      ) : null}
                    </div>
                    <RowButtons
                      prefix="dl"
                      rowKey={row.key}
                      index={i}
                      count={values.deliverables.length}
                      label={`le livrable ${i + 1}`}
                      onMove={(delta) => moveRow("deliverables", i, delta, "dl")}
                      onRemove={() => removeRow("deliverables", i, `${ns}-dl-add`, "dl")}
                    />
                  </li>
                );
              })}
            </ol>
          )}
          {errors.deliverables ? <p className="mb-3 text-sm text-danger">{errors.deliverables}</p> : null}
          {values.deliverables.length < PROJECT_LIMITS.deliverables ? (
            <button id={`${ns}-dl-add`} type="button" onClick={addDeliverable} className={`${btnLine} ${btnSmall}`}>
              <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
              Ajouter un livrable
            </button>
          ) : null}
        </Panel>

        <Panel title="Vidéos YouTube">
          <p className="mb-4 text-sm text-muted">
            La première vidéo est la vidéo principale de la page. Liens acceptés : youtube.com, youtu.be, Shorts.
          </p>
          {values.videos.length === 0 ? (
            <p className="mb-4 text-sm text-muted">Aucune vidéo. Ajoutez un lien YouTube.</p>
          ) : (
            <ol className="m-0 mb-4 list-none p-0">
              {values.videos.map((row, i) => {
                const urlId = `v-url-${row.key}`;
                const titleId = `v-title-${row.key}`;
                const urlError = errors[`videos.${i}.url`] ?? liveVideoError(values.videos, i);
                const titleError = errors[`videos.${i}.title`];
                const videoId = extractYouTubeId(row.url.trim());
                const update = (patch: Partial<VideoRow>) =>
                  set(
                    "videos",
                    values.videos.map((v) => (v.key === row.key ? { ...v, ...patch } : v)),
                  );
                return (
                  <li
                    key={row.key}
                    className="grid grid-cols-1 items-start gap-3.5 border-t border-line py-3.5 first:border-t-0 first:pt-0 min-[1000px]:grid-cols-[120px_minmax(0,1fr)_auto]"
                  >
                    <div className="relative grid aspect-video w-full max-w-[240px] place-items-center overflow-hidden bg-bg text-center text-xs text-muted min-[1000px]:w-[120px]">
                      {videoId ? (
                        <Image src={youTubeThumbnailUrl(videoId)} alt="" fill unoptimized sizes="240px" className="object-cover" />
                      ) : (
                        "Aperçu"
                      )}
                    </div>
                    <div className="min-w-0">
                      <Field
                        id={urlId}
                        label={`Lien YouTube${i === 0 ? " (vidéo principale)" : ` (vidéo ${i + 1})`}`}
                        error={urlError}
                        className="!mb-2.5"
                      >
                        <input
                          id={urlId}
                          type="url"
                          inputMode="url"
                          value={row.url}
                          placeholder="https://youtu.be/..."
                          onChange={(e) => update({ url: e.target.value })}
                          className={inputClass}
                          {...errorProps(urlId, urlError)}
                        />
                      </Field>
                      <Field id={titleId} label="Titre (facultatif)" error={titleError} className="!mb-0">
                        <input
                          id={titleId}
                          value={row.title}
                          maxLength={PROJECT_LIMITS.videoTitle}
                          placeholder="Teaser, version longue, making-of..."
                          onChange={(e) => update({ title: e.target.value })}
                          className={inputClass}
                          {...errorProps(titleId, titleError)}
                        />
                      </Field>
                    </div>
                    <RowButtons
                      prefix="v"
                      rowKey={row.key}
                      index={i}
                      count={values.videos.length}
                      label={`la vidéo ${i + 1}`}
                      onMove={(delta) => moveRow("videos", i, delta, "v")}
                      onRemove={() => removeRow("videos", i, `${ns}-v-add`, "v")}
                      className="min-[1000px]:pt-[30px]"
                    />
                  </li>
                );
              })}
            </ol>
          )}
          {errors.videos ? <p className="mb-3 text-sm text-danger">{errors.videos}</p> : null}
          {values.videos.length < PROJECT_LIMITS.videos ? (
            <button id={`${ns}-v-add`} type="button" onClick={addVideo} className={`${btnLine} ${btnSmall}`}>
              <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
              Ajouter une vidéo
            </button>
          ) : null}
        </Panel>

        {projectId ? (
          <ProjectMedia
            projectId={projectId}
            client={values.client}
            thumbnailPath={thumbnailPath}
            onThumbnail={setThumbnailPath}
            fallbackVideoId={firstVideoId}
            photos={values.photos}
            errors={errors}
            onPhotos={(update) => setValues((v) => ({ ...v, photos: update(v.photos) }))}
            onSavedPhotos={(update) =>
              setSaved((s) => {
                const parsed = JSON.parse(s) as ReturnType<typeof payload>;
                return JSON.stringify({ ...parsed, photos: update(parsed.photos) });
              })
            }
            notify={notify}
          />
        ) : (
          <Panel title="Miniature et photos">
            <p className="text-sm text-muted">
              Enregistrez d’abord le projet : la miniature et les photos pourront ensuite être ajoutées.
            </p>
          </Panel>
        )}

        <div className="sticky bottom-0 z-10 mb-6 flex flex-wrap items-center gap-3 border-t border-line bg-bg py-4">
          <button type="submit" disabled={saving || deleting} className={btnSolid}>
            <Save size={18} strokeWidth={1.8} aria-hidden="true" />
            {saving ? "Enregistrement en cours" : projectId ? "Enregistrer le projet" : "Créer le projet"}
          </button>
          <Link href="/admin/projets" className={btnLine}>
            {dirty ? "Annuler" : "Retour à la liste"}
          </Link>
          {projectId && savedPublished && savedSlug ? (
            <a href={`/realisations/${savedSlug}`} target="_blank" rel="noopener" className={btnLine}>
              <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
              Voir la page<span className="sr-only"> (nouvel onglet)</span>
            </a>
          ) : (
            <button type="button" disabled className={btnLine} aria-describedby={`${ns}-voir-aide`}>
              <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
              Voir la page
            </button>
          )}
          {!(projectId && savedPublished) ? (
            <span id={`${ns}-voir-aide`} className="text-sm text-muted max-[699px]:hidden">
              Page visible une fois le projet publié et enregistré.
            </span>
          ) : null}
          {dirty ? <span className="text-sm text-muted">Modifications non enregistrées</span> : null}
        </div>
      </form>

      {projectId ? (
        <Panel title="Supprimer le projet">
          {confirmDelete ? (
            <div role="group" aria-labelledby={`${ns}-suppr-question`}>
              <p id={`${ns}-suppr-question`} className="mb-4">
                Supprimer définitivement « {name} » ? Ses vidéos, ses photos et sa miniature seront supprimées. Cette
                action est irréversible.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button type="button" onClick={remove} disabled={deleting} className={btnDanger} autoFocus>
                  {deleting ? "Suppression en cours" : "Confirmer la suppression"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    setFocusId(`${ns}-suppr-ouvrir`);
                  }}
                  disabled={deleting}
                  className={btnLine}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button id={`${ns}-suppr-ouvrir`} type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>
              <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
              Supprimer le projet
            </button>
          )}
        </Panel>
      ) : null}

      <Toast state={toast} />
    </>
  );
}

/** Boutons Monter, Descendre et Retirer d'une ligne de liste. */
function RowButtons({
  prefix,
  rowKey,
  index,
  count,
  label,
  onMove,
  onRemove,
  className = "",
}: {
  className?: string;
  prefix: string;
  rowKey: number;
  index: number;
  count: number;
  label: string;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className={`flex shrink-0 gap-1.5 ${className}`}>
      <button
        id={`${prefix}-${rowKey}-up`}
        type="button"
        className={iconBtn}
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label={`Monter ${label}`}
      >
        <ArrowUp size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <button
        id={`${prefix}-${rowKey}-down`}
        type="button"
        className={iconBtn}
        onClick={() => onMove(1)}
        disabled={index === count - 1}
        aria-label={`Descendre ${label}`}
      >
        <ArrowDown size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <button
        id={`${prefix}-${rowKey}-remove`}
        type="button"
        className={iconBtnDanger}
        onClick={onRemove}
        aria-label={`Retirer ${label}`}
      >
        <Trash2 size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}
