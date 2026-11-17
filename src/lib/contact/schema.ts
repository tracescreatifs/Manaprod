import { z } from "@/lib/zod";
import { PROJECT_CATEGORIES } from "@/types/database";

// Validation du formulaire de contact (cahier 6.7), partagée entre le
// navigateur et le serveur (la validation serveur fait foi).

export const PROJECT_TYPES = [...PROJECT_CATEGORIES, "Autre"] as const;

// Questions complémentaires du formulaire par étapes (Prompt 15, D101) :
// listes fermées, posées seulement pour le type concerné.
export const EVENT_TYPE = "Couverture événement" as const;
export const PHOTO_TYPE = "Photographie" as const;
export const EVENT_DURATIONS = ["Une demi-journée", "Une journée", "Plusieurs jours"] as const;
export const PHOTO_KINDS = ["Reportage", "Portraits corporate", "Photographie produit", "Plusieurs"] as const;
/** Réponses proposées à « Pour quand ? » (le champ reste un texte libre de 60 caractères). */
export const WHEN_CHOICES = ["Ce mois-ci", "Dans 1 à 3 mois", "Plus tard", "Je ne sais pas encore"] as const;

export const CONTACT_FIELDS = [
  "name",
  "organization",
  "email",
  "projectType",
  "desiredDate",
  "eventDuration",
  "eventDate",
  "photoKind",
  "message",
] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

/** Nom du champ piège : rempli, l'envoi est ignoré sans le dire. */
export const HONEYPOT_FIELD = "website";

// Une ligne : espaces en tête et en fin retirés, espaces multiples réduits.
const line = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;
// Message : retours chariot normalisés, espaces en fin de ligne retirés,
// au plus une ligne vide entre deux paragraphes.
const block = (value: unknown) =>
  typeof value === "string"
    ? value
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((l) => l.replace(/[ \t]+/g, " ").trimEnd())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : value;
// Champ facultatif vide : absent.
const optional = (value: unknown) => {
  const v = line(value);
  return v === "" || v === null ? undefined : v;
};

export const contactSchema = z.object({
  name: z.preprocess(
    line,
    z
      .string({ error: "Indiquez votre nom." })
      .min(1, { error: "Indiquez votre nom." })
      .max(120, { error: "Votre nom ne doit pas dépasser 120 caractères." }),
  ),
  organization: z.preprocess(
    optional,
    z
      .string()
      .max(160, { error: "Le nom de l’organisation ne doit pas dépasser 160 caractères." })
      .optional(),
  ),
  email: z.preprocess(
    line,
    z
      .string({ error: "Indiquez votre adresse email." })
      .min(1, { error: "Indiquez votre adresse email." })
      .max(254, { error: "L’adresse email ne doit pas dépasser 254 caractères." })
      .pipe(z.email({ error: "Indiquez une adresse email valide, par exemple nom@exemple.com." })),
  ),
  projectType: z.preprocess(
    optional,
    z.enum(PROJECT_TYPES, { error: "Choisissez un type de projet dans la liste." }).optional(),
  ),
  desiredDate: z.preprocess(
    optional,
    z.string().max(60, { error: "La date souhaitée ne doit pas dépasser 60 caractères." }).optional(),
  ),
  eventDuration: z.preprocess(
    optional,
    z.enum(EVENT_DURATIONS, { error: "Choisissez une durée dans la liste." }).optional(),
  ),
  eventDate: z.preprocess(
    optional,
    z.string().max(60, { error: "La date de l’événement ne doit pas dépasser 60 caractères." }).optional(),
  ),
  photoKind: z.preprocess(
    optional,
    z.enum(PHOTO_KINDS, { error: "Choisissez un type de photos dans la liste." }).optional(),
  ),
  message: z.preprocess(
    block,
    z
      .string({ error: "Décrivez votre projet en quelques lignes." })
      .min(1, { error: "Décrivez votre projet en quelques lignes." })
      .min(20, { error: "Décrivez votre projet en au moins 20 caractères." })
      .max(5000, { error: "Votre message ne doit pas dépasser 5000 caractères." }),
  ),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactErrors = Partial<Record<ContactField, string>>;

/** Valide les données reçues ; erreurs en français, une par champ. */
export function parseContact(
  input: Record<string, unknown>,
): { ok: true; data: ContactInput } | { ok: false; errors: ContactErrors } {
  const result = contactSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const errors: ContactErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}

/** Vrai si le champ piège a été rempli (envoi automatisé). */
export function isHoneypotFilled(input: Record<string, unknown>): boolean {
  const value = input[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Demande telle qu'elle est enregistrée et notifiée (D101). Les réponses
 * complémentaires ne valent que pour leur type de projet ; elles sont placées
 * en tête du message (« Durée : Une journée »), sans compter dans la longueur
 * minimale du texte saisi, déjà validée. La date de l'événement remplace la
 * réponse « Pour quand ? » pour une couverture d'événement.
 */
export function composeRequest(data: ContactInput): {
  desiredDate: string | undefined;
  details: string[];
  message: string;
} {
  const details: string[] = [];
  if (data.projectType === EVENT_TYPE && data.eventDuration) details.push(`Durée : ${data.eventDuration}`);
  if (data.projectType === PHOTO_TYPE && data.photoKind) details.push(`Type de photos : ${data.photoKind}`);
  const desiredDate =
    data.projectType === EVENT_TYPE && data.eventDate ? data.eventDate : data.desiredDate;
  const message = details.length > 0 ? `${details.join("\n")}\n\n${data.message}` : data.message;
  return { desiredDate, details, message };
}
