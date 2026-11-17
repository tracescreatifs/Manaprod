"use client";

import { ButtonLink } from "@/components/button-link";

// Contenu de la page d'erreur (D68), même charte que la page 404.
export function ErrorContent({ retry }: { retry: () => void }) {
  return (
    <main className="wrap pt-[clamp(128px,14vw,210px)] pb-[clamp(72px,10vw,150px)]">
      <p className="text-sm text-muted">Erreur</p>
      <h1 className="mt-4 text-[clamp(40px,6.8vw,112px)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance">
        Une erreur est survenue
      </h1>
      <p className="mt-[clamp(24px,3vw,40px)] max-w-[34em] text-[clamp(22px,2.3vw,34px)] leading-[1.28] font-medium tracking-[-0.01em] text-[#C5D3D6]">
        Cette page n’a pas pu être chargée. Réessayez dans un instant.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-[52px] items-center border border-line px-[22px] text-base font-semibold transition-colors hover:border-teal hover:text-teal"
        >
          Réessayer
        </button>
        <ButtonLink href="/">Retour à l’accueil</ButtonLink>
      </div>
    </main>
  );
}
