import { z } from "zod";
import { SLUG_MAX, SLUG_PATTERN } from "@/lib/admin/slug";
import { PROJECT_CATEGORIES } from "@/types/database";
import { extractYouTubeId } from "@/lib/youtube";

// Validation des formulaires du dashboard (cahier 7), partagée entre le
// navigateur et les Server Actions (la validation serveur fait foi).

export type FieldErrors = Record<string, string>;

// Une ligne : espaces en tête et en fin retirés, espaces multiples réduits.
const line = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;

function toErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Résultat de validation : données propres, ou une erreur par champ. */
export function validate<T extends z.ZodType>(
  schema: T,
  input: unknown,
): { ok: true; data: z.infer<T> } | { ok: false; errors: FieldErrors } {
  const result = schema.safeParse(input);
  return result.success ? { ok: true, data: result.data } : { ok: false, errors: toErrors(result.error) };
}

const email = z.preprocess(
  line,
  z
    .string({ error: "Indiquez une adresse email." })
    .min(1, { error: "Indiquez une adresse email." })
    .max(254, { error: "L’adresse email ne doit pas dépasser 254 caractères." })
    .pipe(z.email({ error: "Indiquez une adresse email valide, par exemple nom@exemple.com." })),
);

// ---------------------------------------------------------------------
// Connexion et mots de passe
// ---------------------------------------------------------------------

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "Indiquez votre mot de passe." })
    .min(1, { error: "Indiquez votre mot de passe." })
    .max(200, { error: "Mot de passe trop long." }),
});

export const forgotPasswordSchema = z.object({ email });

export const PASSWORD_MIN = 12;
// Limite de l'algorithme bcrypt utilisé par Supabase Auth.
export const PASSWORD_MAX = 72;

export const newPasswordSchema = z
  .object({
    password: z
      .string({ error: "Choisissez un mot de passe." })
      .min(PASSWORD_MIN, { error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.` })
      .max(PASSWORD_MAX, { error: `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX} caractères.` }),
    confirmation: z.string({ error: "Confirmez le mot de passe." }),
  })
  .refine((data) => data.password === data.confirmation, {
    path: ["confirmation"],
    error: "Les deux mots de passe ne sont pas identiques.",
  });

// ---------------------------------------------------------------------
// Showreel (cahier 7.1)
// ---------------------------------------------------------------------

export const SHOWREEL_TITLE_MAX = 80;

export const showreelSchema = z
  .object({
    url: z.preprocess(
      line,
      z
        .string({ error: "Collez le lien de la vidéo YouTube." })
        .min(1, { error: "Collez le lien de la vidéo YouTube." })
        .max(300, { error: "Ce lien est trop long." }),
    ),
    title: z.preprocess(
      line,
      z
        .string()
        .max(SHOWREEL_TITLE_MAX, {
          error: `Le titre ne doit pas dépasser ${SHOWREEL_TITLE_MAX} caractères.`,
        })
        .transform((title) => title || "Showreel"),
    ),
  })
  .transform((data, ctx) => {
    const youtubeId = extractYouTubeId(data.url);
    if (!youtubeId) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message:
          "Ce lien n’est pas reconnu comme une vidéo YouTube. Copiez l’adresse de la vidéo depuis YouTube (bouton Partager).",
      });
      return z.NEVER;
    }
    return { url: data.url, youtubeId, title: data.title };
  });

// ---------------------------------------------------------------------
// Réglages (cahier 7.5)
// ---------------------------------------------------------------------

export const STATS_MAX = 4;

const statLine = z.object({
  value: z.preprocess(
    line,
    z
      .string({ error: "Indiquez la valeur." })
      .min(1, { error: "Indiquez la valeur." })
      .max(12, { error: "12 caractères au maximum." }),
  ),
  label: z.preprocess(
    line,
    z
      .string({ error: "Indiquez le libellé." })
      .min(1, { error: "Indiquez le libellé." })
      .max(40, { error: "40 caractères au maximum." }),
  ),
});

// Champ facultatif vide : null en base (bloc masqué sur le site).
const optionalLine = (max: number, message: string) =>
  z.preprocess(
    (value) => {
      const v = line(value);
      return v === "" || v === undefined ? null : v;
    },
    z.string().max(max, { error: message }).nullable(),
  );

export const settingsSchema = z.object({
  heroTitle: z.preprocess(
    line,
    z
      .string({ error: "Indiquez la phrase du hero." })
      .min(1, { error: "Indiquez la phrase du hero." })
      .max(200, { error: "La phrase du hero ne doit pas dépasser 200 caractères." }),
  ),
  heroSub: optionalLine(160, "La ligne au-dessus ne doit pas dépasser 160 caractères."),
  stats: z
    .array(statLine, { error: "Chiffres clés illisibles." })
    .max(STATS_MAX, { error: `${STATS_MAX} chiffres clés au maximum.` }),
  phone: optionalLine(40, "Le téléphone ne doit pas dépasser 40 caractères."),
  email: z.preprocess(
    (value) => {
      const v = line(value);
      return v === "" || v === undefined ? null : v;
    },
    z
      .string()
      .max(254, { error: "L’adresse email ne doit pas dépasser 254 caractères." })
      .pipe(z.email({ error: "Indiquez une adresse email valide, par exemple nom@exemple.com." }))
      .nullable(),
  ),
  city: optionalLine(80, "La localisation ne doit pas dépasser 80 caractères."),
  replyPromise: z.preprocess(
    line,
    z
      .string({ error: "Indiquez la promesse de réponse." })
      .min(1, { error: "Indiquez la promesse de réponse." })
      .max(80, { error: "La promesse de réponse ne doit pas dépasser 80 caractères." }),
  ),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

// ---------------------------------------------------------------------
// Projets (cahier 7.2)
// ---------------------------------------------------------------------

export const PROJECT_LIMITS = {
  client: 120,
  title: 160,
  description: 4000,
  deliverables: 30,
  deliverable: 160,
  videos: 20,
  videoTitle: 120,
  photos: 200,
  alt: 200,
  yearMin: 1990,
} as const;

/** Année maximale acceptée : l'année en cours plus un an. */
export const projectYearMax = () => new Date().getFullYear() + 1;

const uuid = z.uuid({ error: "Identifiant invalide." });

const required = (label: string, max: number) =>
  z.preprocess(
    line,
    z
      .string({ error: `Indiquez ${label}.` })
      .min(1, { error: `Indiquez ${label}.` })
      .max(max, { error: `${max} caractères au maximum.` }),
  );

const projectVideo = z.object({
  id: uuid.optional(),
  url: z.preprocess(
    line,
    z
      .string({ error: "Collez le lien de la vidéo YouTube." })
      .min(1, { error: "Collez le lien de la vidéo YouTube, ou retirez la ligne." })
      .max(300, { error: "Ce lien est trop long." }),
  ),
  title: optionalLine(PROJECT_LIMITS.videoTitle, `${PROJECT_LIMITS.videoTitle} caractères au maximum.`),
});

export const projectSchema = z
  .object({
    client: required("le client", PROJECT_LIMITS.client),
    title: required("le titre du projet", PROJECT_LIMITS.title),
    slug: z.preprocess(
      line,
      z
        .string({ error: "Indiquez l’adresse de la page." })
        .min(1, { error: "Indiquez l’adresse de la page." })
        .max(SLUG_MAX, { error: `${SLUG_MAX} caractères au maximum.` })
        .regex(SLUG_PATTERN, {
          error: "Uniquement des lettres minuscules sans accent, des chiffres et des tirets simples (par exemple unicef-staff-team-awards).",
        }),
    ),
    category: z.enum(PROJECT_CATEGORIES, { error: "Choisissez une catégorie dans la liste." }),
    year: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? null : Number(value)),
      z
        .number({ error: "Indiquez une année en chiffres, par exemple 2026." })
        .int({ error: "Indiquez une année en chiffres, par exemple 2026." })
        .min(PROJECT_LIMITS.yearMin, { error: `L’année doit être comprise entre ${PROJECT_LIMITS.yearMin} et ${projectYearMax()}.` })
        .refine((year) => year <= projectYearMax(), {
          error: `L’année doit être comprise entre ${PROJECT_LIMITS.yearMin} et ${projectYearMax()}.`,
        })
        .nullable(),
    ),
    // Paragraphes séparés par des sauts de ligne : seuls les espaces en
    // tête et en fin sont retirés.
    description: z.preprocess(
      (value) => {
        const v = typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() : value;
        return v === "" || v === undefined ? null : v;
      },
      z
        .string()
        .max(PROJECT_LIMITS.description, { error: `La description ne doit pas dépasser ${PROJECT_LIMITS.description} caractères.` })
        .nullable(),
    ),
    // Lignes vides ignorées (liste vide autorisée).
    deliverables: z.preprocess(
      (value) => (Array.isArray(value) ? value.map(line).filter((d) => d !== "") : value),
      z
        .array(z.string().max(PROJECT_LIMITS.deliverable, { error: `${PROJECT_LIMITS.deliverable} caractères au maximum.` }), {
          error: "Livrables illisibles.",
        })
        .max(PROJECT_LIMITS.deliverables, { error: `${PROJECT_LIMITS.deliverables} livrables au maximum.` }),
    ),
    featured: z.boolean({ error: "Valeur invalide." }),
    published: z.boolean({ error: "Valeur invalide." }),
    videos: z
      .array(projectVideo, { error: "Vidéos illisibles." })
      .max(PROJECT_LIMITS.videos, { error: `${PROJECT_LIMITS.videos} vidéos au maximum.` }),
    photos: z
      .array(
        z.object({
          id: uuid,
          alt: optionalLine(PROJECT_LIMITS.alt, `${PROJECT_LIMITS.alt} caractères au maximum.`),
        }),
        { error: "Photos illisibles." },
      )
      .max(PROJECT_LIMITS.photos),
  })
  .transform((data, ctx) => {
    const seen = new Map<string, number>();
    const videos = data.videos.map((video, index) => {
      const youtubeId = extractYouTubeId(video.url);
      if (!youtubeId) {
        ctx.addIssue({
          code: "custom",
          path: ["videos", index, "url"],
          message: "Ce lien n’est pas reconnu comme une vidéo YouTube.",
        });
      } else if (seen.has(youtubeId)) {
        ctx.addIssue({
          code: "custom",
          path: ["videos", index, "url"],
          message: `Cette vidéo est déjà dans la liste (vidéo ${(seen.get(youtubeId) ?? 0) + 1}).`,
        });
      } else {
        seen.set(youtubeId, index);
      }
      return { id: video.id, url: video.url, title: video.title, youtubeId: youtubeId ?? "" };
    });
    if (ctx.issues.length > 0) return z.NEVER;
    return { ...data, videos };
  });

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectData = z.output<typeof projectSchema>;

/** Nouvel ordre des projets : tous les identifiants, sans doublon. */
export const projectOrderSchema = z
  .array(uuid, { error: "Ordre illisible." })
  .min(1)
  .max(500)
  .refine((ids) => new Set(ids).size === ids.length, { error: "Ordre illisible." });

/** Photos téléversées à enregistrer (chemins vérifiés par l'action). */
export const uploadedPhotosSchema = z
  .array(
    z.object({
      path: z.string().max(200),
      width: z.number().int().positive().max(20000),
      height: z.number().int().positive().max(20000),
    }),
  )
  .min(1)
  .max(50);
