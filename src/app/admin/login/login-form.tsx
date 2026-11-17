"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "@/app/admin/actions";
import { Field, errorProps, inputClass } from "@/components/admin/field";
import { FormMessage } from "@/components/admin/form-message";
import { btnSolid } from "@/components/admin/ui";
import { idleState } from "@/lib/admin/action-state";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, idleState);
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
      <Field id="password" label="Mot de passe" error={errors.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
          {...errorProps("password", errors.password)}
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
