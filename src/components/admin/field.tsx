import type { InputHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "w-full min-w-0 border border-line bg-bg px-3.5 py-[13px] text-base leading-[1.4] text-text outline-none placeholder:text-muted focus:border-teal aria-[invalid=true]:border-danger";

// Champ de formulaire du dashboard (prototype .fld) : libellé visible,
// erreur sous le champ reliée par aria-describedby.
export function Field({
  id,
  label,
  error,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-[18px] flex min-w-0 flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      {error ? (
        <p id={`${id}-erreur`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Attributs d'accessibilité d'un champ selon son erreur éventuelle. */
export function errorProps(id: string, error?: string): InputHTMLAttributes<HTMLInputElement> {
  return error ? { "aria-invalid": true, "aria-describedby": `${id}-erreur` } : {};
}
