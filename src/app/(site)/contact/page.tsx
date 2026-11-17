import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { CopyEmail } from "@/components/contact/copy-email";
import { getSiteSettings, siteContact } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Contact | Mana Prod",
  description:
    "Parlons de votre projet : film, campagne ou couverture d’événement. Contactez MANA PROD à Dakar par téléphone, WhatsApp, email ou formulaire.",
};

const filled = (value: string | null | undefined) => value?.trim() || null;

// Messages de l'envoi sans JavaScript : /api/contact redirige vers /contact
// avec une ancre, la note correspondante s'affiche par :target (D63).
const NO_JS_NOTES = [
  { id: "demande-envoyee", text: "Merci, votre demande est bien envoyée. Un email de confirmation vient de vous être adressé." },
  { id: "demande-incomplete", text: "Votre demande n’a pas été envoyée : renseignez votre nom, une adresse email valide et au moins 20 caractères sur votre projet." },
  { id: "demande-limite", text: "Vous avez déjà envoyé plusieurs demandes dans l’heure. Merci de réessayer plus tard, ou de nous appeler directement." },
  { id: "demande-erreur", text: "Votre demande n’a pas pu être enregistrée. Merci de réessayer, ou de nous contacter directement par téléphone ou par email." },
];

const row = "grid grid-cols-1 items-center gap-x-5 gap-y-1.5 border-t border-line py-[22px] min-[561px]:grid-cols-[minmax(0,1fr)_auto]";
const value = "min-w-0 text-[clamp(20px,2.1vw,30px)] leading-[1.2] font-semibold tracking-[-0.015em] [overflow-wrap:anywhere]";

// Page Contact (cahier 6.7, prototype) : coordonnées, « Et ensuite » et
// formulaire. Valeurs lues dans les réglages, blocs masqués si vides.
export default async function ContactPage() {
  const settings = await getSiteSettings();
  const contact = siteContact(settings);
  const replyPromise = filled(settings?.reply_promise);
  const whatsapp = contact.phoneHref ? contact.phoneHref.replace(/\D/g, "") : null;

  return (
    <main className="wrap pt-[clamp(128px,14vw,210px)] pb-[clamp(72px,10vw,150px)]">
      <h1 className="text-[clamp(40px,6.8vw,112px)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance">
        Parlons de votre projet
      </h1>
      <p className="mt-[clamp(24px,3vw,40px)] max-w-[34em] text-[clamp(22px,2.3vw,34px)] leading-[1.28] font-medium tracking-[-0.01em] text-pretty text-[#C5D3D6]">
        Un film, une campagne, une couverture d’événement : dites-nous ce que vous avez en tête.
        {replyPromise ? ` ${replyPromise}.` : ""}
      </p>

      {NO_JS_NOTES.map((note) => (
        <p
          key={note.id}
          id={note.id}
          role="status"
          className="mt-8 hidden scroll-mt-32 border border-line bg-bg-2 p-5 target:block"
        >
          {note.text}
        </p>
      ))}

      <div className="mt-[clamp(40px,5vw,72px)] grid items-start gap-[clamp(40px,7vw,128px)] min-[821px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <div className="border-b border-line">
            {contact.phone ? (
              <div className={row}>
                <span className="col-span-full text-sm text-muted">Téléphone et WhatsApp</span>
                {contact.phoneHref ? (
                  <a href={contact.phoneHref} className={`${value} transition-colors hover:text-teal`}>
                    {contact.phone}
                  </a>
                ) : (
                  <span className={value}>{contact.phone}</span>
                )}
                {whatsapp ? (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Écrire sur WhatsApp au ${contact.phone} (nouvel onglet)`}
                    className="inline-flex min-h-11 items-center gap-2 justify-self-start border border-line px-3.5 text-sm leading-none font-semibold whitespace-nowrap transition-colors hover:border-teal hover:text-teal"
                  >
                    WhatsApp
                    <MessageCircle aria-hidden="true" size={16} strokeWidth={1.8} />
                  </a>
                ) : null}
              </div>
            ) : null}
            {contact.email ? (
              <div className={row}>
                <span className="col-span-full text-sm text-muted">Email</span>
                <a href={`mailto:${contact.email}`} className={`${value} transition-colors hover:text-teal`}>
                  {contact.email}
                </a>
                <div className="justify-self-start">
                  <CopyEmail email={contact.email} />
                </div>
              </div>
            ) : null}
            {contact.city ? (
              <div className={row}>
                <span className="col-span-full text-sm text-muted">Studio</span>
                <span className={value}>{contact.city}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-9 grid gap-3.5">
            <h2 className="text-[15px] font-semibold text-muted">Et ensuite</h2>
            <ol className="grid gap-2.5 text-base text-[#C5D3D6]">
              {[
                // Délai lu dans les réglages, étape masquée s'il est vide.
                replyPromise ? `${replyPromise}.` : null,
                "Un échange court pour cadrer le brief, le budget et le calendrier.",
                "Une proposition claire, puis le tournage.",
              ]
                .filter((step): step is string => Boolean(step))
                .map((step, i) => (
                  <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)]">
                    <span aria-hidden="true" className="font-bold text-teal">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
            </ol>
          </div>
        </div>

        <ContactForm replyPromise={replyPromise} phone={contact.phone} email={contact.email} />
      </div>
    </main>
  );
}
