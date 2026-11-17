"use client";

import { useSyncExternalStore } from "react";
import { ProjectCard, type ProjectCardData } from "@/components/project-card";
import { categoryFromSlug, categorySlug } from "@/lib/categories";
import { plural } from "@/lib/format";

const PARAM = "categorie";
const EVENT = "realisations:categorie";

// Filtre lu dans l'URL (?categorie=...). La page reste entièrement statique :
// le rendu serveur affiche tous les projets, le filtre est appliqué dans le
// navigateur après le chargement (décision D54).
function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(EVENT, callback);
  };
}
const readParam = () => new URLSearchParams(window.location.search).get(PARAM) ?? "";
const serverParam = () => "";

function writeParam(value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(PARAM, value);
  else url.searchParams.delete(PARAM);
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(EVENT));
}

export type GridProject = ProjectCardData & { category: string };

// Filtres par catégorie et grille éditoriale (cahier 6.3, prototype .flt et
// .grid--ed) : rythme 7/5 puis 5/7 sur grand écran, une colonne sur mobile.
export function ProjectGrid({
  projects,
  categories,
}: {
  projects: GridProject[];
  categories: string[];
}) {
  const slug = useSyncExternalStore(subscribe, readParam, serverParam);
  const active = categoryFromSlug(slug, categories);
  const visible = active ? projects.filter((p) => p.category === active) : projects;

  const filters: { label: string; value: string | null }[] = [
    { label: "Tous", value: null },
    ...categories.map((c) => ({ label: c, value: c })),
  ];

  return (
    <>
      <div
        role="group"
        aria-label="Filtrer par catégorie"
        className="mt-[clamp(32px,4vw,56px)] flex flex-wrap gap-2.5"
      >
        {filters.map((filter) => {
          const pressed = filter.value === active;
          return (
            <button
              key={filter.label}
              type="button"
              aria-pressed={pressed}
              onClick={() => writeParam(filter.value ? categorySlug(filter.value) : null)}
              className={`inline-flex min-h-[46px] items-center rounded-full border px-5 text-[15px] leading-[1.3] transition-colors duration-200 ${
                pressed
                  ? "border-text bg-text font-semibold text-ink"
                  : "border-line font-medium text-muted hover:border-muted hover:text-text"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {active
          ? `${plural(visible.length, "projet")} dans la catégorie ${active}.`
          : `${plural(visible.length, "projet")} affichés.`}
      </p>

      <ul className="grid-ed mt-[clamp(32px,4vw,56px)] grid grid-cols-1 items-start gap-x-[clamp(16px,2vw,32px)] gap-y-[clamp(40px,5vw,80px)] min-[821px]:grid-cols-12">
        {visible.map((project) => (
          <li key={project.slug} className="min-w-0 min-[821px]:col-span-6">
            <ProjectCard
              project={project}
              headingLevel={2}
              sizes="(min-width: 821px) 58vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </>
  );
}
