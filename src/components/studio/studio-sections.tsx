import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { PhotoGallery } from "@/components/project/photo-gallery";
import {
  STUDIO_BACKSTAGE_TITLE,
  STUDIO_CTA,
  STUDIO_HERO,
  STUDIO_LANGUAGES,
  STUDIO_NUMBERS_KICKER,
  STUDIO_STORY,
  STUDIO_TEAM,
  type StudioSegment,
} from "@/content/marque";
import type { BackstagePhoto } from "@/lib/data/backstage";
import { siteContact, type SiteSettings } from "@/lib/data/settings";
import type { TeamMember } from "@/lib/data/team";
import { initials, parseStatValue } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { isLitePanel } from "@/lib/studio";
import type { SiteStat } from "@/types/database";

// Sections de la page Le studio immersive (maquette, D99). Tout le texte
// est rendu par le serveur, dans l'ordre de lecture ; le mouvement est
// ajouté par StudioMotion (attributs data-studio-*).

const RING_PATH =
  "M4,50A46,46 0 1 0 96,50A46,46 0 1 0 4,50ZM16.19,52.898A38.64,38.64 0 1 0 93.47,52.898A38.64,38.64 0 1 0 16.19,52.898Z";

const two = (n: number) => String(n).padStart(2, "0");

function Segments({ parts }: { parts: StudioSegment[] }) {
  return (
    <>
      {parts.map((part, i) => (part.em ? <em key={i}>{part.text}</em> : <span key={i}>{part.text}</span>))}
    </>
  );
}

/** 1. Ouverture : photo d'ouverture, titre révélé mot par mot en CSS (D41). */
export function StudioHero({ photo }: { photo: string }) {
  return (
    <section className="studio-hero" aria-labelledby="studio-titre">
      <div className="studio-hero__media" aria-hidden="true">
        <div className="studio-hero__photo">
          <Image src={photo} alt="" fill preload fetchPriority="high" sizes="(max-width: 820px) 100vw, 62vw" />
        </div>
        <div className="studio-hero__leak" />
        <div className="studio-hero__grain" />
      </div>
      <div className="studio-hero__copy">
        <p className="studio-kicker">{STUDIO_HERO.kicker}</p>
        <h1 id="studio-titre" className="studio-hero__title">
          {STUDIO_HERO.title.map((word, i) => (
            <span key={word}>
              <span className="hero-word">
                <span style={{ "--i": i } as React.CSSProperties} className={i === STUDIO_HERO.title.length - 1 ? "text-teal" : undefined}>
                  {word}
                </span>
              </span>
              {i < STUDIO_HERO.title.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
      </div>
      <div className="studio-hint" aria-hidden="true">
        <i />
        Défiler
      </div>
    </section>
  );
}

/** 2. Récit : l'éclipse se forme (géométrie du logo officiel) et 3 phrases. */
export function StudioStory() {
  return (
    <section className="studio-story" data-studio-story aria-labelledby="studio-recit">
      <div className="studio-story__stage">
        <h2 id="studio-recit" className="studio-kicker studio-story__label">
          {STUDIO_STORY.kicker}
        </h2>
        <div className="studio-story__eclipse" aria-hidden="true">
          <div className="studio-story__halo" data-studio-halo />
          <svg viewBox="0 0 100 100">
            <defs>
              <clipPath id="studio-half-right">
                <rect x="50" y="-10" width="60" height="120" />
              </clipPath>
              <clipPath id="studio-half-left">
                <rect x="-10" y="-10" width="60" height="120" />
              </clipPath>
              {/* Deux demi-plans qui tournent découvrent l'anneau (transform seul). */}
              <mask id="studio-ring-mask" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
                <g transform="rotate(-50 50 50)">
                  <g clipPath="url(#studio-half-right)">
                    <rect className="studio-ring-a" data-studio-ring-a x="50" y="-10" width="60" height="120" fill="white" />
                  </g>
                  <g clipPath="url(#studio-half-left)">
                    <rect className="studio-ring-b" data-studio-ring-b x="50" y="-10" width="60" height="120" fill="white" />
                  </g>
                </g>
              </mask>
            </defs>
            <circle cx="50" cy="50" r="46" fill="none" stroke="#223239" strokeWidth=".4" />
            <path fillRule="evenodd" fill="#2EC4CF" d={RING_PATH} mask="url(#studio-ring-mask)" />
            <circle className="studio-disc" data-studio-disc cx="54.83" cy="52.898" r="38.64" fill="#060A0C" />
            <circle data-studio-dot cx="16.126" cy="29.676" r="5.457" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="studio-story__lines">
          {STUDIO_STORY.lines.map((parts, i) => (
            <p key={i} className="studio-story__line" data-studio-line>
              <Segments parts={parts} />
            </p>
          ))}
        </div>
        <div className="studio-story__progress" aria-hidden="true">
          {STUDIO_STORY.lines.map((_, i) => (
            <span key={i} data-studio-progress />
          ))}
        </div>
      </div>
    </section>
  );
}

/** 3. En chiffres : panneaux plein cadre, compteurs (valeur finale dans le HTML). */
export function StudioNumbers({ stats }: { stats: SiteStat[] }) {
  if (stats.length === 0) return null;
  return (
    <section
      className="studio-numbers"
      data-studio-numbers
      data-count={stats.length}
      style={{ "--n": stats.length } as React.CSSProperties}
      aria-labelledby="studio-chiffres"
    >
      <div className="studio-numbers__stage">
        <h2 id="studio-chiffres" className="studio-kicker studio-numbers__label" data-studio-numbers-label>
          {STUDIO_NUMBERS_KICKER}
        </h2>
        <ul className="studio-numbers__track m-0 list-none p-0" data-studio-numbers-track>
          {stats.map((stat, i) => {
            const parsed = parseStatValue(stat.value);
            return (
              <li
                key={i}
                className={`studio-numbers__panel${isLitePanel(i, stats.length) ? " is-lite" : ""}`}
                data-studio-panel
              >
                <p className="studio-numbers__big">
                  <span className="sr-only">{stat.value}</span>
                  {parsed ? (
                    <span aria-hidden="true">
                      <span data-studio-count={parsed.number}>{parsed.number}</span>
                      {parsed.suffix ? <sup>{parsed.suffix}</sup> : null}
                    </span>
                  ) : (
                    <span aria-hidden="true">{stat.value}</span>
                  )}
                </p>
                <p className="studio-numbers__cap">
                  <small aria-hidden="true">{two(i + 1)}</small>
                  {stat.label}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** 4. Nos langues : les mots glissent en sens opposés, puis le texte. */
export function StudioLanguages() {
  return (
    <section className="studio-lang" data-studio-lang aria-labelledby="studio-langues">
      <h2 id="studio-langues" className="studio-kicker mb-9">
        {STUDIO_LANGUAGES.kicker}
      </h2>
      <p className="studio-lang__words">
        {STUDIO_LANGUAGES.words.map((word, i) => (
          <span
            key={word.text}
            data-studio-word={word.dir}
            className={i === 1 ? "is-outline" : i === 2 ? "is-teal" : undefined}
          >
            {word.text}
          </span>
        ))}
      </p>
      <Reveal>
        <p className="studio-lang__text">
          <strong>{STUDIO_LANGUAGES.lead}</strong> {STUDIO_LANGUAGES.text}
        </p>
      </Reveal>
    </section>
  );
}

/** 5. L'équipe : portraits 4:5, présentation dépliée au clic ou à Entrée. */
export function StudioTeam({ team }: { team: TeamMember[] }) {
  if (team.length === 0) return null;
  return (
    <section className="studio-team" data-studio-team aria-labelledby="studio-equipe">
      <div className="studio-team__stage">
        <div className="studio-team__head">
          <p className="studio-kicker">{STUDIO_TEAM.kicker}</p>
          <h2 id="studio-equipe" className="studio-team__title">
            {STUDIO_TEAM.title}
          </h2>
        </div>
        <ul className="studio-team__track m-0 list-none" data-studio-team-track>
          {team.map((member, i) => {
            const bio = member.bio?.trim();
            const bioId = `studio-bio-${member.id}`;
            return (
              <li key={member.id} className="studio-card" data-studio-card>
                <div className="studio-card__photo">
                  {member.photo_path ? (
                    <Image
                      src={mediaUrl(member.photo_path)}
                      alt={member.name}
                      fill
                      sizes="(max-width: 820px) 260px, 30vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#10191D_0%,#1a2b32_100%)] text-[56px] font-extrabold text-bg-3"
                    >
                      {initials(member.name)}
                    </div>
                  )}
                  <span className="studio-card__num" aria-hidden="true">
                    {two(i + 1)}
                  </span>
                  <div className="studio-card__who">
                    <h3>{member.name}</h3>
                    {member.role?.trim() ? <p>{member.role}</p> : null}
                  </div>
                  {bio ? (
                    <button
                      type="button"
                      className="studio-card__toggle"
                      aria-expanded="false"
                      aria-controls={bioId}
                      data-studio-card-toggle
                    >
                      <span className="sr-only">Présentation de {member.name}</span>
                    </button>
                  ) : null}
                </div>
                {bio ? (
                  <div className="studio-card__bio" id={bioId}>
                    <p>{bio}</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** 6. Dans les coulisses : grille éditoriale et visionneuse ; masquée sans photo. */
export function StudioBackstage({ photos }: { photos: BackstagePhoto[] }) {
  if (photos.length === 0) return null;
  const gallery = photos.map((photo, i) => ({
    id: photo.id,
    src: mediaUrl(photo.storage_path),
    alt: photo.alt?.trim() || `Dans les coulisses de MANA PROD (${i + 1})`,
    width: photo.width,
    height: photo.height,
  }));
  return (
    <section className="studio-backstage" aria-labelledby="studio-coulisses">
      <Reveal>
        <h2 id="studio-coulisses" className="studio-backstage__title">
          {STUDIO_BACKSTAGE_TITLE}
        </h2>
      </Reveal>
      <PhotoGallery photos={gallery} label="Photos des coulisses" layout="editorial" />
    </section>
  );
}

/** 7. Appel final : coordonnées et promesse lues dans les réglages. */
export function StudioCta({ settings }: { settings: SiteSettings | null }) {
  const contact = siteContact(settings);
  const promise = settings?.reply_promise?.trim() || null;
  return (
    <section className="studio-cta" aria-labelledby="studio-appel">
      <svg className="studio-cta__ring" viewBox="0 0 100 100" aria-hidden="true">
        <path fillRule="evenodd" fill="#2EC4CF" d={RING_PATH} />
      </svg>
      <Reveal>
        <p className="studio-kicker mb-7">{STUDIO_CTA.kicker}</p>
        <h2 id="studio-appel">
          <Link href="/contact" className="studio-cta__big">
            {STUDIO_CTA.lines[0]}{" "}
            <br />
            {STUDIO_CTA.lines[1]}
          </Link>
        </h2>
        {contact.phone || contact.email || promise ? (
          <ul className="m-0 mt-10 flex list-none flex-wrap gap-x-7 gap-y-2 p-0 text-lg text-muted">
            {contact.phone && contact.phoneHref ? (
              <li>
                <a href={contact.phoneHref} className="inline-flex min-h-11 items-center font-semibold text-text hover:text-teal">
                  {contact.phone}
                </a>
              </li>
            ) : null}
            {contact.email ? (
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center hover:text-teal">
                  {contact.email}
                </a>
              </li>
            ) : null}
            {promise ? <li className="inline-flex min-h-11 items-center">{promise}</li> : null}
          </ul>
        ) : null}
      </Reveal>
    </section>
  );
}
