import { LogoEmpile } from "@/components/logo-empile";
import { Reveal } from "@/components/motion/reveal";
import { WordReveal } from "@/components/motion/word-reveal";
import { getSiteSettings, siteContact } from "@/lib/data/settings";

const linkClass = "inline-flex min-h-11 items-center transition-colors hover:text-teal";

// Page d'accueil minimale du socle, remplacée par l'accueil complet au Prompt 04.
// Phrase et coordonnées lues dans les réglages ; une valeur vide est masquée.
export default async function Home() {
  const settings = await getSiteSettings();
  const heroTitle = settings?.hero_title.trim();
  const contact = siteContact(settings);
  const hasContact = Boolean(contact.phone || contact.email || contact.city);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 pt-32 pb-16 text-center sm:px-8">
      <h1 className="text-text">
        <LogoEmpile width="min(78vw, 420px)" />
      </h1>
      {heroTitle ? (
        <p className="mt-10 max-w-[22em] text-[clamp(22px,4vw,34px)] leading-tight font-semibold tracking-[-0.02em] text-balance">
          <WordReveal text={heroTitle} />
        </p>
      ) : null}
      {hasContact ? (
        <Reveal className="mt-10">
          <ul className="flex flex-col items-center gap-1 text-base text-muted sm:flex-row sm:gap-8">
            {contact.phone ? (
              <li>
                {contact.phoneHref ? (
                  <a href={contact.phoneHref} className={linkClass}>
                    {contact.phone}
                  </a>
                ) : (
                  contact.phone
                )}
              </li>
            ) : null}
            {contact.email ? (
              <li>
                <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>
                  {contact.email}
                </a>
              </li>
            ) : null}
            {contact.city ? <li className="inline-flex min-h-11 items-center">{contact.city}</li> : null}
          </ul>
        </Reveal>
      ) : null}
    </main>
  );
}
