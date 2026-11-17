// Échappement HTML : aucun texte saisi par un visiteur n'est interprété
// comme du HTML dans un email.
const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/** Texte multiligne échappé, sauts de ligne conservés. */
export function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}
