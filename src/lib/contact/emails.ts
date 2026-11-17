import { escapeHtml, escapeMultiline } from "@/lib/contact/escape";
import { composeRequest, type ContactInput } from "@/lib/contact/schema";
import { SIGNATURE } from "@/lib/site";

// Contenu des deux emails du formulaire de contact (cahier 6.7, D28).
// Versions HTML et texte ; toutes les valeurs saisies sont échappées.

export type EmailContent = { subject: string; html: string; text: string };

const WRAP_START =
  '<div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#0A1013;max-width:600px">';
const WRAP_END = "</div>";

/** Notification envoyée à Mana Prod, avec toutes les informations saisies. */
export function notificationEmail(input: ContactInput): EmailContent {
  // Même texte que le message enregistré : réponses complémentaires en tête (D101).
  const composed = composeRequest(input);
  const data = { ...input, desiredDate: composed.desiredDate, message: composed.message };
  const type = data.projectType ?? "type non précisé";
  const rows: [string, string][] = [
    ["Nom", data.name],
    ["Organisation", data.organization ?? "Non précisée"],
    ["Email", data.email],
    ["Type de projet", data.projectType ?? "Non précisé"],
    ["Date souhaitée", data.desiredDate ?? "Non précisée"],
  ];

  const text = [
    "Nouvelle demande reçue depuis le formulaire de contact du site.",
    "",
    ...rows.map(([label, value]) => `${label} : ${value}`),
    "",
    "Message :",
    data.message,
    "",
    `Répondez directement à cet email pour écrire à ${data.name}.`,
  ].join("\n");

  const html = [
    WRAP_START,
    "<p>Nouvelle demande reçue depuis le formulaire de contact du site.</p>",
    '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse">',
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="color:#55666B;vertical-align:top">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    ),
    "</table>",
    '<p style="margin-top:20px;color:#55666B">Message</p>',
    `<p style="border-left:2px solid #2EC4CF;padding-left:12px">${escapeMultiline(data.message)}</p>`,
    `<p style="color:#55666B">Répondez directement à cet email pour écrire à ${escapeHtml(data.name)}.</p>`,
    WRAP_END,
  ].join("");

  return { subject: `Nouvelle demande : ${data.name} (${type})`, html, text };
}

/**
 * Accusé de réception envoyé au visiteur. Ne reprend jamais son message ni
 * les autres champs saisis, seulement son nom pour la salutation (D28).
 */
export function acknowledgementEmail({
  name,
  replyPromise,
  phone,
}: {
  name: string;
  replyPromise: string | null;
  phone: string | null;
}): EmailContent {
  const lines = [
    `Bonjour ${name},`,
    `Merci pour votre demande, elle nous est bien parvenue.${replyPromise ? ` ${replyPromise}.` : ""}`,
    ...(phone ? [`Pour toute question urgente, vous pouvez nous appeler au ${phone}.`] : []),
  ];

  const text = [...lines.flatMap((l) => [l, ""]), "L’équipe Mana Prod", SIGNATURE].join("\n");
  const html = [
    WRAP_START,
    ...lines.map((l) => `<p>${escapeHtml(l)}</p>`),
    `<p>L’équipe Mana Prod<br><span style="color:#55666B">${escapeHtml(SIGNATURE)}</span></p>`,
    WRAP_END,
  ].join("");

  return { subject: "Votre demande a bien été reçue | Mana Prod", html, text };
}
