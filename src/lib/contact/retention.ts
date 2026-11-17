// Durée de conservation des messages du formulaire de contact (mentions
// légales, P11) : 24 mois après leur réception.

export const MESSAGE_RETENTION_MONTHS = 24;

/**
 * Date limite : un message reçu strictement avant cette date est à effacer.
 * Calcul en mois calendaires (UTC) ; un jour inexistant (29 février, 31)
 * est ramené au dernier jour du mois.
 */
export function retentionCutoff(now: Date, months: number = MESSAGE_RETENTION_MONTHS): Date {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() - months;
  const target = new Date(Date.UTC(year, month, 1, now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(now.getUTCDate(), lastDay));
  return target;
}
