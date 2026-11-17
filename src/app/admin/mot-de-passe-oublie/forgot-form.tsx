"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset } from "@/app/admin/actions";
import { Field, errorProps, inputClass } from "@/components/admin/field";
import { FormMessage } from "@/components/admin/form-message";
import { btnSolid } from "@/components/admin/ui";
import { idleState } from "@/lib/admin/action-state";

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, idleState);
  const errors = state.errors ?? {};
  // Champ contrôlé : l’adresse reste saisie après une tentative refusée.
  const [email, setEmail] = useState("");

  return (
    <form action={action} noValidate>
      <Field id="email" label="Email" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          {...errorProps("email", errors.email)}
        />
      </Field>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={`${btnSolid} mt-4 w-full py-[18px] text-base`}>
        {pending ? "Envoi en cours" : "Recevoir le lien"}
      </button>
      <p className="mt-6 text-[15px]">
        <Link href="/admin/login" className="inline-flex min-h-11 items-center text-muted no-underline hover:text-teal">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
