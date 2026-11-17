import "server-only";
import { Resend } from "resend";
import { missingVariableError } from "@/lib/env";

// Envoi des emails avec Resend (D03). Variables lues seulement à l'envoi :
// le build et le prérendu n'en ont pas besoin.

function required(name: "RESEND_API_KEY" | "CONTACT_TO_EMAIL" | "CONTACT_FROM_EMAIL"): string {
  const value = process.env[name];
  if (!value) throw missingVariableError(name);
  return value;
}

export function getMailer() {
  return {
    resend: new Resend(required("RESEND_API_KEY")),
    to: required("CONTACT_TO_EMAIL"),
    from: `Mana Prod <${required("CONTACT_FROM_EMAIL")}>`,
  };
}
