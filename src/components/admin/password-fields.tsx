import { Field, errorProps, inputClass } from "@/components/admin/field";
import type { FieldErrors } from "@/lib/admin/schemas";
import { PASSWORD_MIN } from "@/lib/admin/schemas";

// Nouveau mot de passe et confirmation (même règle partout : 12 caractères
// minimum, confirmation identique).
export function PasswordFields({ errors, idPrefix = "" }: { errors: FieldErrors; idPrefix?: string }) {
  const pid = `${idPrefix}password`;
  const cid = `${idPrefix}confirmation`;
  return (
    <>
      <Field id={pid} label="Nouveau mot de passe" hint={`${PASSWORD_MIN} caractères minimum.`} error={errors.password}>
        <input
          id={pid}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN}
          className={inputClass}
          {...errorProps(pid, errors.password)}
        />
      </Field>
      <Field id={cid} label="Confirmation du mot de passe" error={errors.confirmation}>
        <input
          id={cid}
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
          className={inputClass}
          {...errorProps(cid, errors.confirmation)}
        />
      </Field>
    </>
  );
}
