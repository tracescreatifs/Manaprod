import type { Metadata } from "next";
import { ArrowDown, Mail, MessageCircle, Phone } from "lucide-react";
import { ContactRequest } from "@/components/contact/contact-request";
import { CopyEmail } from "@/components/contact/copy-email";
import { DakarClock } from "@/components/contact/dakar-clock";
import {
  HeroSlideshow,
  type HeroSlide,
} from "@/components/contact/hero-slideshow";
import { TimelineMotion } from "@/components/contact/timeline-motion";
import { CONTACT_DIRECT, CONTACT_HERO, CONTACT_NEXT } from "@/content/contact";
import { getBackstagePhotos } from "@/lib/data/backstage";
import { getSiteSettings, siteContact } from "@/lib/data/settings";
import { mediaUrl } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { studioHeroSource } from "@/lib/studio";

export const metadata: Metadata = pageMetadata({
  title: "Contact | Mana Prod",
  description:
    "Parlons de votre projet : film, campagne ou couverture d’événement. Contactez MANA PROD à Dakar par téléphone, WhatsApp, email ou formulaire.",
  path: "/contact",
});

// Diaporama de l'ouverture : les premières photos des coulisses seulement,
// pour ne pas charger toute la galerie derrière le titre (D101).
const MAX_SLIDES = 8;

const filled = (value: string | null | undefined) => value?.trim() || null;

// Page Contact orientée conversion (cahier 6.7, maquette
// docs/reference/mana-prod-contact-maquette.html, D101) : ouverture sur les
// coulisses, formulaire par étapes, contact direct, « Et ensuite ».
// Coordonnées et promesse de réponse lues dans les réglages, blocs masqués
// si vides. Page statique : l'heure de Dakar est calculée dans le navigateur.
export default async function ContactPage() {
  const [settings, backstage] = await Promise.all([
    getSiteSettings(),
    getBackstagePhotos(),
  ]);
  const contact = siteContact(settings);
  const replyPromise = filled(settings?.reply_promise);
  const whatsapp = contact.phoneHref
    ? `https://wa.me/${contact.phoneHref.replace(/\D/g, "")}`
    : null;

  const slides: HeroSlide[] =
    backstage.length > 0
      ? backstage.slice(0, MAX_SLIDES).map((photo) => ({
          src: mediaUrl(photo.storage_path),
          caption: filled(photo.alt),
        }))
      : [
          {
            src: mediaUrl(studioHeroSource(settings?.studio_hero_path)),
            caption: null,
          },
        ];

  const nextSteps = [
    replyPromise ? `${replyPromise}.` : null,
    ...CONTACT_NEXT.steps,
  ].filter((s): s is string => Boolean(s));

  return (
    <main>
      {/* 1. Ouverture */}
      <section className="contact-hero" aria-labelledby="contact-titre">
        <HeroSlideshow slides={slides} />
        <p className="contact-kicker">{CONTACT_HERO.kicker}</p>
        <h1 id="contact-titre" className="contact-hero__title">
          {CONTACT_HERO.title.map((word, i) => (
            <span key={word}>
              <span className="hero-word">
                <span
                  style={{ "--i": i } as React.CSSProperties}
                  className={
                    i === CONTACT_HERO.title.length - 1
                      ? "text-teal"
                      : undefined
                  }
                >
                  {word}
                </span>
              </span>
              {i < CONTACT_HERO.title.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        <div className="contact-meta">
          <DakarClock />
          {replyPromise ? <span>{replyPromise}</span> : null}
        </div>
        <div className="contact-ctas">
          <a className="btn btn--down" href="#demande">
            {CONTACT_HERO.primary}
            <span className="btn__ic" aria-hidden="true">
              <ArrowDown size={20} strokeWidth={1.8} />
            </span>
          </a>
          {whatsapp ? (
            <a
              className="btn btn--ghost"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              {CONTACT_HERO.whatsapp}
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          ) : null}
        </div>
      </section>

      {/* 2. Formulaire par étapes */}
      <section
        id="demande"
        className="contact-conv"
        aria-labelledby="demande-titre"
      >
        <ContactRequest replyPromise={replyPromise} />
      </section>

      {/* 3. Contact direct */}
      {contact.phone || contact.email ? (
        <section
          className="contact-direct"
          aria-labelledby="contact-direct-titre"
        >
          <h2 id="contact-direct-titre" className="contact-kicker">
            {CONTACT_DIRECT.title}
          </h2>
          {contact.phone && contact.phoneHref ? (
            <div className="contact-act">
              <a href={contact.phoneHref}>
                <span className="contact-orb" aria-hidden="true">
                  <Phone strokeWidth={1.5} />
                </span>
                <span>
                  <span className="contact-act__t">{CONTACT_DIRECT.call}</span>
                  <span className="contact-act__s">{contact.phone}</span>
                </span>
              </a>
            </div>
          ) : null}
          {whatsapp ? (
            <div className="contact-act">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <span className="contact-orb" aria-hidden="true">
                  <MessageCircle strokeWidth={1.5} />
                </span>
                <span>
                  <span className="contact-act__t">
                    {CONTACT_DIRECT.whatsapp}
                  </span>
                  <span className="contact-act__s">
                    {CONTACT_DIRECT.whatsappLine}
                    <span className="sr-only"> (nouvel onglet)</span>
                  </span>
                </span>
              </a>
            </div>
          ) : null}
          {contact.email ? (
            <div className="contact-act">
              <a href={`mailto:${contact.email}`}>
                <span className="contact-orb" aria-hidden="true">
                  <Mail strokeWidth={1.5} />
                </span>
                <span>
                  <span className="contact-act__t">{CONTACT_DIRECT.email}</span>
                  <span className="contact-act__s">{contact.email}</span>
                </span>
              </a>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <CopyEmail email={contact.email} />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 4. Et ensuite */}
      <section className="contact-next" aria-labelledby="contact-ensuite">
        <p className="contact-kicker">{CONTACT_NEXT.kicker}</p>
        <h2 id="contact-ensuite">
          {nextSteps.length === 3
            ? CONTACT_NEXT.title
            : CONTACT_NEXT.titleTwoSteps}
        </h2>
        <div
          id="contact-frise"
          className="contact-tl"
          style={{ "--steps": nextSteps.length } as React.CSSProperties}
        >
          <span className="contact-tl__bar" aria-hidden="true" />
          <ol className="contact-tl__list">
            {nextSteps.map((text, i) => (
              <li key={text}>
                <span className="contact-tl__node" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
        <TimelineMotion targetId="contact-frise" />
      </section>
    </main>
  );
}
