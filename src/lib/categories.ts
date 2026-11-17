// Catégorie dans l'URL de la page Réalisations (?categorie=...) : forme
// courte sans accents ni espaces, par exemple « couverture-evenement ».

export function categorySlug(category: string): string {
  return category
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Catégorie correspondant à une valeur d'URL, parmi celles proposées, sinon null. */
export function categoryFromSlug<T extends string>(
  slug: string | null | undefined,
  categories: readonly T[],
): T | null {
  if (!slug) return null;
  return categories.find((c) => categorySlug(c) === slug) ?? null;
}
