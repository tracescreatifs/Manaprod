import Image from "next/image";

// Page d'accueil minimale du socle, remplacée par l'accueil complet au Prompt 03.
export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <Image
        src="/brand/mana-prod-empile-ecran-halo-fond-sombre.svg"
        alt="MANA PROD"
        width={399}
        height={140}
        preload
        className="h-auto w-[min(78vw,420px)]"
      />
      <p className="mt-10 max-w-[22em] text-[clamp(22px,4vw,34px)] font-semibold leading-tight tracking-[-0.02em] text-balance">
        C’est toujours celui qui éclaire qui demeure dans l’obscurité.
      </p>
      <ul className="mt-10 flex flex-col items-center gap-1 text-base text-muted sm:flex-row sm:gap-8">
        <li>
          <a
            href="tel:+221780114308"
            className="inline-flex min-h-11 items-center transition-colors hover:text-teal"
          >
            +221 78 011 43 08
          </a>
        </li>
        <li>
          <a
            href="mailto:amathndiaye@manaprod.com"
            className="inline-flex min-h-11 items-center break-all transition-colors hover:text-teal"
          >
            amathndiaye@manaprod.com
          </a>
        </li>
      </ul>
    </main>
  );
}
