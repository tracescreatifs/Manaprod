// Limitation des envois du formulaire de contact (D62, D66) : au plus
// 5 envois par empreinte d'IP sur une heure glissante. Les opérateurs
// mobiles partagent souvent une même adresse IP entre de nombreux abonnés.

export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60 * 60 * 1000;
/** Les lignes plus anciennes sont purgées à chaque envoi accepté. */
export const PURGE_AFTER_MS = 24 * 60 * 60 * 1000;

/** Vrai si un nouvel envoi dépasserait la limite, vu le nombre d'envois récents. */
export function isRateLimited(recentCount: number): boolean {
  return recentCount >= RATE_LIMIT;
}
