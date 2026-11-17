import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionRow } from "@/components/section-row";
import { LEGAL_IDS, LEGAL_UPDATED_ON } from "@/content/mentions-legales";
import { getSiteSettings, siteContact } from "@/lib/data/settings";
import { formatDateFr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Mentions légales | Mana Prod",
  description:
    "Mentions légales et politique de confidentialité du site de MANA PROD, agence de production audiovisuelle à Dakar.",
};

const prose = "grid max-w-[44em] gap-4 text-[#C5D3D6] [&_a]:text-text [&_a:hover]:text-teal [&_strong]:font-semibold [&_strong]:text-text";
const linkClass = "transition-colors";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-4 gap-y-1 border-b border-line py-3.5 first:border-t min-[561px]:grid-cols-[minmax(110px,220px)_minmax(0,1fr)]">
      <dt className="text-[15px] text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-text">{children}</dd>
    </div>
  );
}

// Mentions légales et confidentialité (cahier 6.9, D11). Seuls les faits
// connus sont publiés ; les identifiants légaux vides sont masqués.
export default async function MentionsLegalesPage() {
  const contact = siteContact(await getSiteSettings());

  return (
    <main className="wrap pt-[clamp(128px,14vw,210px)] pb-[clamp(72px,10vw,150px)]">
      <h1 className="text-[clamp(40px,6.8vw,112px)] leading-[0.98] font-extrabold tracking-[-0.035em]">
        Mentions légales
      </h1>
      <p className="mt-5 text-muted">
        Dernière mise à jour : <time dateTime={LEGAL_UPDATED_ON}>{formatDateFr(LEGAL_UPDATED_ON)}</time>
      </p>

      <SectionRow title="Éditeur du site" first className="mt-[clamp(40px,5vw,72px)]">
        <dl>
          <Fact label="Éditeur">MANA PROD, agence de production audiovisuelle, Dakar, Sénégal</Fact>
          <Fact label="Directeur de la publication">Amath NDIAYE</Fact>
          {LEGAL_IDS.ninea ? <Fact label="NINEA">{LEGAL_IDS.ninea}</Fact> : null}
          {LEGAL_IDS.rccm ? <Fact label="RCCM">{LEGAL_IDS.rccm}</Fact> : null}
          {LEGAL_IDS.headOffice ? <Fact label="Siège">{LEGAL_IDS.headOffice}</Fact> : null}
          {contact.phone ? (
            <Fact label="Téléphone">
              {contact.phoneHref ? (
                <a href={contact.phoneHref} className={`${linkClass} hover:text-teal`}>
                  {contact.phone}
                </a>
              ) : (
                contact.phone
              )}
            </Fact>
          ) : null}
          {contact.email ? (
            <Fact label="Email">
              <a href={`mailto:${contact.email}`} className={`${linkClass} hover:text-teal`}>
                {contact.email}
              </a>
            </Fact>
          ) : null}
        </dl>
      </SectionRow>

      <SectionRow title="Hébergement">
        <div className={prose}>
          <p>
            Le site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Avenue #4133,
            Covina, CA 91723, États-Unis (
            <a href="https://vercel.com" className={linkClass} rel="noopener">
              vercel.com
            </a>
            ).
          </p>
        </div>
      </SectionRow>

      <SectionRow title="Données et stockage">
        <div className={prose}>
          <p>
            La base de données et les fichiers du site (photos, logos) sont gérés avec{" "}
            <strong>Supabase</strong>, dans un centre de données situé dans l’Union européenne, à
            Paris.
          </p>
        </div>
      </SectionRow>

      <SectionRow title="Confidentialité">
        <div className={prose}>
          <p>
            <strong>Données collectées.</strong> Le formulaire de contact recueille votre nom, votre
            organisation, votre adresse email, le type de projet, la date souhaitée et votre
            message.
          </p>
          <p>
            <strong>Finalité.</strong> Ces informations servent uniquement à répondre à votre
            demande et à échanger avec vous sur votre projet.
          </p>
          <p>
            <strong>Base.</strong> Le traitement repose sur votre démarche : c’est vous qui nous
            contactez par le formulaire.
          </p>
          <p>
            <strong>Destinataires.</strong> Vos données sont accessibles à l’équipe de Mana Prod
            uniquement. Elles ne sont ni vendues ni cédées.
          </p>
          <p>
            <strong>Durée de conservation.</strong> Vos données sont conservées 24 mois après notre
            dernier échange, puis supprimées.
          </p>
          <p>
            <strong>Vos droits.</strong> Conformément à la loi sénégalaise n° 2008-12 du 25 janvier
            2008 sur la protection des données à caractère personnel, vous disposez d’un droit
            d’accès, de rectification, d’opposition et de suppression de vos données.
            {contact.email ? (
              <>
                {" "}Pour les exercer, écrivez-nous à{" "}
                <a href={`mailto:${contact.email}`} className={linkClass}>
                  {contact.email}
                </a>
                .
              </>
            ) : null}{" "}
            Vous pouvez également saisir la Commission de protection des données personnelles
            (CDP).
          </p>
        </div>
      </SectionRow>

      <SectionRow title="Cookies">
        <div className={prose}>
          <p>
            Le site public ne dépose aucun cookie de mesure d’audience ni aucun cookie publicitaire.
          </p>
          <p>
            Les vidéos sont intégrées avec le mode de confidentialité renforcée de YouTube
            (youtube-nocookie.com). Lorsque vous lancez une vidéo, YouTube peut stocker des
            informations sur votre appareil.
          </p>
          <p>
            Seuls les administrateurs du site, lorsqu’ils sont connectés, utilisent un cookie de
            session technique.
          </p>
        </div>
      </SectionRow>

      <SectionRow title="Propriété intellectuelle">
        <div className={prose}>
          <p>
            Les vidéos, photos, logo et textes présentés sur ce site appartiennent à Mana Prod ou à
            ses clients. Toute reproduction, même partielle, est soumise à autorisation préalable.
          </p>
        </div>
      </SectionRow>
    </main>
  );
}
