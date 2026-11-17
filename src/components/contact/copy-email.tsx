"use client";

import { useState } from "react";

// Bouton « Copier » de l'adresse email (prototype .crow__a). Confirmation
// annoncée aux lecteurs d'écran ; repli si l'API du presse-papiers manque.
function copyWithFallback(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export function CopyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState("");

  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = copyWithFallback(email);
    setStatus(ok ? "Adresse copiée" : `Copie impossible : sélectionnez l’adresse ${email}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copier l’adresse ${email}`}
        className="inline-flex min-h-11 items-center gap-2 border border-line px-3.5 text-sm leading-none font-semibold whitespace-nowrap transition-colors hover:border-teal hover:text-teal"
      >
        Copier
      </button>
      <p role="status" className={status ? "col-span-full text-sm text-teal" : "sr-only"}>
        {status}
      </p>
    </>
  );
}
