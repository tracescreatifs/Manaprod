// Étiquettes de cache partagées entre la lecture des données (cacheTag) et
// la revalidation après un enregistrement dans le dashboard (Prompts 09 à 11).
export const CACHE_TAGS = {
  settings: "settings",
  projects: "projects",
  clients: "clients",
  team: "team",
} as const;

/** Étiquette d'un projet précis, pour une revalidation ciblée de sa fiche. */
export function projectTag(slug: string): string {
  return `project:${slug}`;
}
