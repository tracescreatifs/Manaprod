"use client";

import { useId, useState, type ReactNode } from "react";
import { btnDanger, btnLine, btnSmall } from "@/components/admin/ui";
import { useFocusLater } from "@/components/admin/use-focus-later";

// Suppression en deux temps (cahier 7.2) : un premier bouton affiche la
// question et le bouton de confirmation, qui reçoit le focus.
export function ConfirmButton({
  question,
  confirmLabel,
  onConfirm,
  pending,
  trigger,
  triggerClassName,
  triggerLabel,
}: {
  question: string;
  confirmLabel: string;
  onConfirm: () => void;
  pending: boolean;
  trigger: ReactNode;
  triggerClassName: string;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ns = useId();
  const focusLater = useFocusLater();
  if (!open) {
    return (
      <button id={`${ns}-ouvrir`} type="button" className={triggerClassName} aria-label={triggerLabel} onClick={() => setOpen(true)}>
        {trigger}
      </button>
    );
  }
  return (
    <div role="group" aria-labelledby={`${ns}-question`} className="flex w-full flex-wrap items-center gap-2">
      <p id={`${ns}-question`} className="w-full text-sm">
        {question}
      </p>
      <button type="button" className={`${btnDanger} ${btnSmall}`} onClick={onConfirm} disabled={pending} autoFocus>
        {pending ? "Suppression en cours" : confirmLabel}
      </button>
      <button
        type="button"
        className={`${btnLine} ${btnSmall}`}
        disabled={pending}
        onClick={() => {
          setOpen(false);
          focusLater(`${ns}-ouvrir`);
        }}
      >
        Annuler
      </button>
    </div>
  );
}
