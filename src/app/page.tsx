import { LogoEmpile } from "@/components/logo-empile";
import { Reveal } from "@/components/motion/reveal";
import { WordReveal } from "@/components/motion/word-reveal";
import { CONTACT, SIGNATURE } from "@/lib/site";

// Page d'accueil minimale du socle, remplacée par l'accueil complet au Prompt 04.
export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 pt-32 pb-16 text-center sm:px-8">
      <h1 className="text-text">
        <LogoEmpile width="min(78vw, 420px)" />
      </h1>
      <p className="mt-10 max-w-[22em] text-[clamp(22px,4vw,34px)] leading-tight font-semibold tracking-[-0.02em] text-balance">
        <WordReveal text={SIGNATURE} />
      </p>
      <Reveal className="mt-10">
        <ul className="flex flex-col items-center gap-1 text-base text-muted sm:flex-row sm:gap-8">
          <li>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex min-h-11 items-center transition-colors hover:text-teal"
            >
              {CONTACT.phone}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex min-h-11 items-center break-all transition-colors hover:text-teal"
            >
              {CONTACT.email}
            </a>
          </li>
        </ul>
      </Reveal>
    </main>
  );
}
