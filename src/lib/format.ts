// Petits utilitaires de texte, purs et testés.

/** « 1 vidéo », « 2 vidéos ». Le pluriel ajoute un « s ». */
export function plural(count: number, word: string): string {
  return `${count} ${word}${count > 1 ? "s" : ""}`;
}

/**
 * Tronque un texte sur une limite de mot, avec des points de suspension.
 * Les espaces et sauts de ligne multiples sont réduits à un espace.
 */
export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.]+$/, "")}…`;
}

/** Paragraphes d'un texte saisi en base : séparés par les sauts de ligne. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
