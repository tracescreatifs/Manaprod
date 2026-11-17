"use client";

import { useState, type FormEvent } from "react";
import type { ActionState } from "@/lib/admin/action-state";
import type { FieldErrors } from "@/lib/admin/schemas";

const FIX_FIELDS = "Certains champs sont à corriger.";

// Validation dans le navigateur avant l'envoi (la Server Action valide de
// nouveau). En cas d'erreur : envoi bloqué, notification, focus sur le
// premier champ à corriger.
export function useClientCheck(serverState: ActionState) {
  const [check, setCheck] = useState<{ errors: FieldErrors; at: number } | null>(null);

  function run(event: FormEvent<HTMLFormElement>, errors: FieldErrors | null) {
    if (!errors) {
      setCheck(null);
      return;
    }
    event.preventDefault();
    const form = event.currentTarget;
    setCheck({ errors, at: Date.now() });
    requestAnimationFrame(() => {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  const latestServer = !check || (serverState.at ?? 0) > check.at;
  return {
    errors: latestServer ? (serverState.errors ?? {}) : check.errors,
    toast: latestServer ? serverState : ({ status: "error", message: FIX_FIELDS, at: check.at } as ActionState),
    run,
    reset: () => setCheck(null),
  };
}
