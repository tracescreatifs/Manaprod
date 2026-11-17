// Lien tel: construit à partir d'un numéro saisi librement en base :
// espaces et séparateurs retirés, « + » initial du format international conservé.
// Renvoie null si le numéro ne contient aucun chiffre.
export function telHref(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}
