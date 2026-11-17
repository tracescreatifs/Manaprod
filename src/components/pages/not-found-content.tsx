import { ButtonLink } from "@/components/button-link";

// Contenu de la page 404 personnalisée (charte du prototype).
export function NotFoundContent() {
  return (
    <main className="wrap pt-[clamp(128px,14vw,210px)] pb-[clamp(72px,10vw,150px)]">
      <p className="text-sm text-muted">Erreur 404</p>
      <h1 className="mt-4 text-[clamp(40px,6.8vw,112px)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance">
        Page introuvable
      </h1>
      <p className="mt-[clamp(24px,3vw,40px)] max-w-[34em] text-[clamp(22px,2.3vw,34px)] leading-[1.28] font-medium tracking-[-0.01em] text-[#C5D3D6]">
        Cette page n’existe pas ou n’est pas encore disponible.
      </p>
      <p className="mt-10">
        <ButtonLink href="/">Retour à l’accueil</ButtonLink>
      </p>
    </main>
  );
}
