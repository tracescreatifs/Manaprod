import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

// Mise en page des écrans d'accès (prototype .gate) : connexion, mot de
// passe oublié, nouveau mot de passe.
export function Gate({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <main id="contenu" tabIndex={-1} className="grid min-h-svh place-items-center p-6 outline-none">
      <div className="w-full max-w-[440px]">
        <Logo width={210} className="mb-9 block max-w-full text-white" />
        <h1 className="mb-3 text-[clamp(28px,5vw,42px)] font-extrabold tracking-[-0.03em]">{title}</h1>
        {intro ? <p className="mb-7 text-muted">{intro}</p> : null}
        {children}
      </div>
    </main>
  );
}

/** Message d'information affiché au-dessus d'un formulaire d'accès. */
export function GateNotice({ tone, children }: { tone: "info" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mb-6 border px-4 py-3.5 text-[15px] ${
        tone === "error" ? "border-danger text-danger" : "border-line text-text"
      }`}
    >
      {children}
    </p>
  );
}
