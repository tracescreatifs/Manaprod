"use client";

import Link from "next/link";
import { useActionState, useState, useId } from "react";
import { login } from "@/app/admin/actions";
import { Field, errorProps, inputClass } from "@/components/admin/field";
import { FormMessage } from "@/components/admin/form-message";
import { btnSolid } from "@/components/admin/ui";
import { idleState } from "@/lib/admin/action-state";

export function LoginForm() {
  // Identifiants uniques même quand le routeur garde la page en mémoire (D83).
  const ns = useId();
  const [state, action, pending] = useActionState(login, idleState);
  const errors = state.errors ?? {};
  // Champ contrôlé : l’adresse reste saisie après une tentative refusée.
  const [email, setEmail] = useState("");

  return (
    <form action={action} noValidate>
      <Field id={`${ns}-email`} label="Email" error={errors.email}>
        <input
          id={`${ns}-email`}
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          {...errorProps(`${ns}-email`, errors.email)}
        />
      </Field>
      <Field id={`${ns}-password`} label="Mot de passe" error={errors.password}>
        <input
          id={`${ns}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
          {...errorProps(`${ns}-password`, errors.password)}
        />
      </Field>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={`${btnSolid} mt-4 w-full py-[18px] text-base`}>
        {pending ? "Connexion en cours" : "Se connecter"}
      </button>
      <p className="mt-6 text-[15px]">
        <Link
          href="/admin/mot-de-passe-oublie"
          className="inline-flex min-h-11 items-center text-muted no-underline hover:text-teal"
        >
          Mot de passe oublié
        </Link>
      </p>
    </form>
  );
}
