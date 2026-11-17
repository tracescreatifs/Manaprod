import type { FieldErrors } from "@/lib/admin/schemas";

// Résultat d'une Server Action du dashboard, affiché par le formulaire :
// notification de succès ou d'erreur, et erreurs champ par champ.
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
  /** Horodatage : chaque résultat déclenche une nouvelle notification. */
  at?: number;
};

export const idleState: ActionState = { status: "idle" };

export const success = (message: string): ActionState => ({ status: "success", message, at: Date.now() });

export const failure = (message: string, errors?: FieldErrors): ActionState => ({
  status: "error",
  message,
  errors,
  at: Date.now(),
});

/** Résultat horodaté maintenant (nouvelle notification), pour un résultat construit dans le navigateur. */
export const stamped = (state: ActionState): ActionState => ({ ...state, at: Date.now() });
