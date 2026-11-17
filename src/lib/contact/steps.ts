import { EVENT_TYPE, PHOTO_TYPE } from "@/lib/contact/schema";

// Enchaînement du formulaire Contact par étapes (maquette, D101). Fonctions
// pures, partagées par le composant et les tests.

export type StepKey =
  | "type"
  | "photo"
  | "eventDays"
  | "eventDate"
  | "when"
  | "details";

export type Answers = {
  projectType?: string;
  photoKind?: string;
  eventDuration?: string;
  eventDate?: string;
  desiredDate?: string;
};

/** Étapes du parcours selon le type choisi. */
export function stepsFor(projectType: string | undefined): StepKey[] {
  if (projectType === PHOTO_TYPE) return ["type", "photo", "when", "details"];
  if (projectType === EVENT_TYPE)
    return ["type", "eventDays", "eventDate", "details"];
  return ["type", "when", "details"];
}

/** Part de l'anneau remplie (0 à 1) : étapes franchies sur le total, 1 après l'envoi. */
export function progressShare(
  step: StepKey | "done",
  projectType: string | undefined,
): number {
  if (step === "done") return 1;
  const steps = stepsFor(projectType);
  return Math.max(0, steps.indexOf(step)) / steps.length;
}

/** Réponses utiles au parcours en cours (une réponse d'un autre type est écartée). */
export function relevantAnswers(answers: Answers): Answers {
  const steps = stepsFor(answers.projectType);
  const out: Answers = {};
  if (answers.projectType) out.projectType = answers.projectType;
  if (steps.includes("photo") && answers.photoKind)
    out.photoKind = answers.photoKind;
  if (steps.includes("eventDays") && answers.eventDuration)
    out.eventDuration = answers.eventDuration;
  if (steps.includes("eventDate") && answers.eventDate?.trim())
    out.eventDate = answers.eventDate.trim();
  if (steps.includes("when") && answers.desiredDate)
    out.desiredDate = answers.desiredDate;
  return out;
}

/** Pilules du récapitulatif, dans l'ordre des questions. */
export function recapOf(answers: Answers): string[] {
  const a = relevantAnswers(answers);
  return [
    a.projectType,
    a.photoKind,
    a.eventDuration,
    a.desiredDate,
    a.eventDate,
  ].filter((v): v is string => Boolean(v));
}
