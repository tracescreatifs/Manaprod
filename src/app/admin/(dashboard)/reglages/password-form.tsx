"use client";

import { useActionState, type FormEvent } from "react";
import { changePassword } from "@/app/admin/actions";
import { Panel } from "@/components/admin/page-head";
import { PasswordFields } from "@/components/admin/password-fields";
import { Toast } from "@/components/admin/toast";
import { useClientCheck } from "@/components/admin/use-client-check";
import { btnSolid } from "@/components/admin/ui";
import { idleState } from "@/lib/admin/action-state";
import { newPasswordSchema, validate } from "@/lib/admin/schemas";

// Changement du mot de passe du compte connecté (mêmes règles que la
// réinitialisation : 12 caractères minimum, confirmation identique).
export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, idleState);
  const { errors, toast, run } = useClientCheck(state);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const check = validate(newPasswordSchema, {
      password: data.get("password"),
      confirmation: data.get("confirmation"),
    });
    run(event, check.ok ? null : check.errors);
  }

  return (
    <form action={action} onSubmit={onSubmit} noValidate>
      <Panel title="Mot de passe">
        <div className="grid grid-cols-1 gap-x-5 min-[1000px]:grid-cols-2">
          <PasswordFields errors={errors} idPrefix="pw-" />
        </div>
        <button type="submit" disabled={pending} className={btnSolid}>
          {pending ? "Modification en cours" : "Changer le mot de passe"}
        </button>
      </Panel>
      <Toast state={toast} />
    </form>
  );
}
