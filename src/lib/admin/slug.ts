// Adresse (slug) d'un projet : minuscules, sans accents, mots séparés par
// un tiret simple (cahier 7.2).

export const SLUG_MAX = 120;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Transforme un texte libre en slug ; chaîne vide si rien d'utilisable. */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= SLUG_MAX) return slug;
  // Coupe à la fin d'un mot, sans tiret final.
  const cut = slug.slice(0, SLUG_MAX);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut).replace(/-+$/, "");
}

/** Slug proposé à partir du client et du titre. */
export function projectSlug(client: string, title: string): string {
  return slugify(`${client} ${title}`);
}
