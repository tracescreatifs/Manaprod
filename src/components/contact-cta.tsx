import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { siteContact, type SiteSettings } from "@/lib/data/settings";

const filled = (value: string | null | undefined) => value?.trim() || null;

// Appel final « Parlons de votre projet » (prototype .cta), sur l'accueil et
// la page Réalisations. Rappel de la promesse de réponse et des coordonnées,
// masqué si la promesse est vide en base.
export function ContactCta({ settings }: { settings: SiteSettings | null }) {
  const contact = siteContact(settings);
  const replyPromise = filled(settings?.reply_promise);
  const line = replyPromise
    ? [`${replyPromise}.`, [contact.phone, contact.email].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <section className="border-t border-line py-[clamp(80px,12vw,180px)]">
      <div className="wrap">
        <Reveal>
          <Link
            href="/contact"
            className="inline-flex items-center gap-[0.3em] text-[clamp(34px,7.4vw,124px)] leading-none font-extrabold tracking-[-0.04em] text-balance transition-colors duration-[250ms] hover:text-teal"
          >
            Parlons de votre projet
            <ArrowRight aria-hidden="true" className="size-[0.6em] shrink-0" strokeWidth={1.8} />
          </Link>
          {line ? <p className="mt-7 text-sm text-muted">{line}</p> : null}
        </Reveal>
      </div>
    </section>
  );
}
