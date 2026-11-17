import type { ReactNode } from "react";

export function PageHead({ title, lead }: { title: string; lead: ReactNode }) {
  return (
    <>
      <h1 className="mb-2 text-[clamp(28px,3.4vw,46px)] font-extrabold tracking-[-0.03em]">{title}</h1>
      <p className="mb-8 max-w-[64ch] text-base text-muted">{lead}</p>
    </>
  );
}

/** Panneau du dashboard (prototype .panel). */
export function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`mb-6 border border-line bg-bg-2 p-[clamp(20px,3vw,32px)] ${className}`}>
      <h2 className="mb-[18px] text-lg tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

/** Chargement des données d'un onglet. */
export function PanelLoading() {
  return (
    <p role="status" className="border border-line bg-bg-2 p-8 text-muted">
      Chargement
    </p>
  );
}
