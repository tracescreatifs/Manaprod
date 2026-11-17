import "server-only";
import { Resend } from "resend";

// Envoi des emails avec Resend (D03). Variables lues seulement à l'envoi :
// le build et le prérendu n'en ont pas besoin.

function required(name: "RESEND_API_KEY" | "CONTACT_TO_EMAIL" | "CONTACT_FROM_EMAIL"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Ajoutez-la dans Vercel (Settings, Environment Variables), puis redéployez le site.`,
    );
  }
  return value;
}

export function getMailer() {
  return {
    resend: new Resend(required("RESEND_API_KEY")),
    to: required("CONTACT_TO_EMAIL"),
    from: `Mana Prod <${required("CONTACT_FROM_EMAIL")}>`,
  };
}
