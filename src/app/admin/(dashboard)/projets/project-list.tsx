"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil } from "lucide-react";
import { reorderProjects } from "@/app/admin/project-actions";
import { ProjectThumb } from "@/components/admin/project-thumb";
import { Toast } from "@/components/admin/toast";
import { useFocusLater } from "@/components/admin/use-focus-later";
import { iconBtn } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/action-state";
import { moveItem } from "@/lib/admin/list";
import type { AdminProjectRow } from "@/lib/admin/projects";

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

// Liste des projets (cahier 7.2, prototype .prow) : ordre du site, statut,
// boutons Monter et Descendre (ordre enregistré en une seule action).
export function ProjectList({ initial }: { initial: AdminProjectRow[] }) {
  const [projects, setProjects] = useState(initial);
  // Nouvelles données du serveur (après un enregistrement, ou au retour sur
  // la page gardée en mémoire par le routeur) : la liste les reprend.
  const [source, setSource] = useState(initial);
  if (initial !== source) {
    setSource(initial);
    setProjects(initial);
  }
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const [pending, startTransition] = useTransition();
  const setFocusTarget = useFocusLater();

  function move(index: number, delta: number) {
    // Un déplacement à la fois (les boutons restent actifs pour garder le focus).
    if (pending) return;
    const previous = projects;
    const next = moveItem(projects, index, delta);
    const moved = next[index + delta];
    setProjects(next);
    // Le focus suit le projet déplacé ; en bout de liste, l'autre bouton.
    const newIndex = index + delta;
    const sameDirectionPossible = delta < 0 ? newIndex > 0 : newIndex < next.length - 1;
    setFocusTarget(`pl-${moved.id}-${sameDirectionPossible === (delta < 0) ? "up" : "down"}`);
    startTransition(async () => {
      const result = await reorderProjects(next.map((p) => p.id));
      if (result.status === "error") setProjects(previous);
      setState(result);
    });
  }

  if (projects.length === 0) {
    return (
      <p className="border border-dashed border-line p-12 text-center text-muted">Aucun projet. Créez le premier.</p>
    );
  }

  return (
    <>
      <ol className="m-0 list-none border border-line bg-bg-2 px-[clamp(16px,3vw,32px)] py-2" aria-label="Projets dans l’ordre du site">
        {projects.map((p, i) => {
          const name = `${p.client} : ${p.title}`;
          return (
            <li
              key={p.id}
              className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-t border-line py-3.5 first:border-t-0 min-[1000px]:grid-cols-[96px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto]"
            >
              <div className="relative aspect-[16/10] w-[72px] overflow-hidden bg-bg min-[1000px]:w-24">
                <ProjectThumb thumbnailPath={p.thumbnailPath} videoId={p.videoId} photoPath={p.photoPath} client={p.client} sizes="96px" />
              </div>
              <div className="min-w-0">
                <b className="block font-semibold break-words">{p.client}</b>
                <small className="block text-sm break-words text-muted">{p.title}</small>
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs leading-none font-semibold ${
                      p.published ? "border-teal text-teal" : "border-line text-muted"
                    }`}
                  >
                    {p.published ? "Publié" : "Brouillon"}
                  </span>
                  {p.featured ? (
                    <span className="inline-block rounded-full border border-line px-2.5 py-1 text-xs leading-none font-semibold text-text">
                      À la une
                    </span>
                  ) : null}
                </span>
              </div>
              <small className="col-span-2 text-sm text-muted min-[1000px]:col-span-1">
                {p.category}
                {p.year ? `, ${p.year}` : ""}
              </small>
              <small className="col-span-2 text-sm text-muted min-[1000px]:col-span-1">
                {plural(p.videoCount, "vidéo")}, {plural(p.photoCount, "photo")}
              </small>
              <div className="col-span-2 flex flex-wrap gap-1.5 min-[1000px]:col-span-1 min-[1000px]:justify-end">
                <button
                  id={`pl-${p.id}-up`}
                  type="button"
                  className={iconBtn}
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Monter ${name}`}
                >
                  <ArrowUp size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button
                  id={`pl-${p.id}-down`}
                  type="button"
                  className={iconBtn}
                  onClick={() => move(i, 1)}
                  disabled={i === projects.length - 1}
                  aria-label={`Descendre ${name}`}
                >
                  <ArrowDown size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
                {p.published ? (
                  <a
                    href={`/realisations/${p.slug}`}
                    target="_blank"
                    rel="noopener"
                    className={iconBtn}
                    aria-label={`Voir la page de ${name} (nouvel onglet)`}
                  >
                    <ExternalLink size={18} strokeWidth={1.8} aria-hidden="true" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={iconBtn}
                    aria-label={`Voir la page de ${name} : indisponible, le projet n’est pas publié`}
                  >
                    <ExternalLink size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                )}
                <Link href={`/admin/projets/${p.id}`} className={`${iconBtn} w-auto gap-2 px-3 text-sm font-semibold`}>
                  <Pencil size={16} strokeWidth={1.8} aria-hidden="true" />
                  Modifier<span className="sr-only"> {name}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
      <Toast state={state} />
    </>
  );
}
