import { createHmac } from "node:crypto";

// Empreinte de l'adresse IP pour la limitation des envois (D10, D62) :
// HMAC-SHA256 avec une clé dérivée d'un secret serveur. L'adresse IP n'est
// jamais stockée en clair et l'empreinte ne peut pas être recalculée sans
// le secret.

const KEY_LABEL = "mana-prod:contact-rate-limit:v1";

/** Clé de l'empreinte, dérivée d'un secret serveur avec un libellé fixe. */
export function deriveIpHashKey(secret: string): Buffer {
  return createHmac("sha256", secret).update(KEY_LABEL).digest();
}

/** Empreinte hexadécimale (64 caractères) d'une adresse IP. */
export function hashIp(ip: string, key: Buffer): string {
  return createHmac("sha256", key).update(ip.trim().toLowerCase()).digest("hex");
}

/**
 * Adresse IP du visiteur : première valeur de x-forwarded-for (renseigné par
 * Vercel), sinon x-real-ip, sinon « inconnue » (tous ces envois partagent
 * alors la même limite).
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  const real = headers.get("x-real-ip")?.trim();
  return real || "inconnue";
}
