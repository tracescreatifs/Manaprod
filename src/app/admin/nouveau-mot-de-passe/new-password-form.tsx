"use client";

import { useActionState } from "react";
import { setNewPassword } from "@/app/admin/actions";
import { FormMessage } from "@/components/admin/form-message";
import { PasswordFields } from "@/components/admin/password-fields";
import { btnSolid } from "@/components/admin/ui";
import { idleState } from "@/lib/admin/action-state";

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(setNewPassword, idleState);
  return (
    <form action={action} noValidate>
      <PasswordFields errors={state.errors ?? {}} />
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={`${btnSolid} mt-4 w-full py-[18px] text-base`}>
        {pending ? "Enregistrement en cours" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
