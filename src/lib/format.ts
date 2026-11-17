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

/**
 * Chiffre clé découpé pour l'animation : partie numérique en tête et reste
 * conservé tel quel (« 20+ » donne 20 et « + », « 4K » donne 4 et « K »).
 * Null si la valeur ne commence pas par un chiffre (affichée directement).
 */
export function parseStatValue(value: string): { number: number; suffix: string } | null {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  if (!match) return null;
  return { number: Number(match[1]), suffix: match[2] };
}

/** Initiales d'un nom (deux au plus), pour un portrait sans photo. */
export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M"
  );
}

/** Parties d'une date formatée, avec « 1er » pour le premier jour du mois. */
function joinWithFirst(parts: Intl.DateTimeFormatPart[]): string {
  return parts.map((part) => (part.type === "day" && part.value === "1" ? "1er" : part.value)).join("");
}

/** Date sans heure (AAAA-MM-JJ) affichée en français, sans décalage de fuseau, « 1er » compris. */
export function formatDateFr(date: string): string {
  return joinWithFirst(
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(new Date(`${date}T12:00:00`)),
  );
}

const MESSAGE_DATE = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Africa/Dakar",
  dateStyle: "long",
  timeStyle: "short",
});

/**
 * Date et heure de réception d'un message, à l'heure de Dakar (fr-FR), avec
 * « 1er » pour le premier jour du mois (« 1er décembre 2026 à 09:30 »).
 */
export function formatMessageDate(iso: string): string {
  return joinWithFirst(MESSAGE_DATE.formatToParts(new Date(iso)));
}
