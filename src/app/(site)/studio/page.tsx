import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { ContactCta } from "@/components/contact-cta";
import { SectionRow } from "@/components/section-row";
import { StatValue } from "@/components/studio/stat-value";
import { EQUIPMENT, LANGUAGES, STUDIO_PRESENTATION } from "@/content/marque";
import { getSiteSettings } from "@/lib/data/settings";
import { getTeam } from "@/lib/data/team";
import { initials } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export const metadata: Metadata = pageMetadata({
  title: "Le studio | Mana Prod",
  description:
    "MANA PROD, agence de production audiovisuelle basée à Dakar, portée par Amath NDIAYE : équipe, chiffres clés et équipement.",
  path: "/studio",
});

const lede = "text-[clamp(22px,2.3vw,34px)] leading-[1.28] font-medium tracking-[-0.01em] text-pretty";

// Page Le studio (cahier 6.6, prototype) : présentation, chiffres, langues,
// équipe et équipement. Une section sans données est masquée.
export default async function StudioPage() {
  const [settings, team] = await Promise.all([getSiteSettings(), getTeam()]);
  const stats = (settings?.stats ?? []).filter((s) => s.value?.trim() && s.label?.trim());

  return (
    <>
      <main className="wrap pt-[clamp(128px,14vw,210px)] pb-[clamp(72px,10vw,150px)]">
        <h1 className="text-[clamp(40px,6.8vw,112px)] leading-[0.98] font-extrabold tracking-[-0.035em]">
          Le studio
        </h1>

        <SectionRow title="Mana Prod" first className="mt-[clamp(40px,5vw,72px)]">
          <div className="grid max-w-[40em] gap-5 text-[#C5D3D6]">
            <p className={`${lede} text-text`}>{STUDIO_PRESENTATION.lede}</p>
            {STUDIO_PRESENTATION.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </SectionRow>

        {stats.length > 0 ? (
          <SectionRow title="En chiffres">
            <dl className="grid grid-cols-2 gap-7 min-[701px]:grid-cols-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col-reverse">
                  <dt className="mt-2 text-[15px] text-muted">{stat.label}</dt>
                  <dd className="text-[clamp(32px,4vw,56px)] leading-none font-extrabold tracking-[-0.035em]">
                    <StatValue value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </SectionRow>
        ) : null}

        <SectionRow title="Français et wolof">
          <div className="grid max-w-[40em] gap-5 text-[#C5D3D6]">
            <p className={`${lede} text-text`}>{LANGUAGES.lede}</p>
            <p>{LANGUAGES.text}</p>
          </div>
        </SectionRow>

        {team.length > 0 ? (
          <SectionRow title="L’équipe">
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-x-6 gap-y-9">
              {team.map((member) => (
                <li key={member.id}>
                  <figure className="m-0">
                    <div className="relative aspect-[4/5] overflow-hidden bg-bg-2">
                      {member.photo_path ? (
                        <Image
                          src={mediaUrl(member.photo_path)}
                          alt={member.name}
                          fill
                          sizes="(min-width: 1480px) 300px, (min-width: 821px) 22vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#10191D_0%,#1a2b32_100%)] text-[44px] font-extrabold text-bg-3"
                        >
                          {initials(member.name)}
                        </div>
                      )}
                    </div>
                    <figcaption>
                      <h3 className="mt-4 text-xl leading-[1.05] font-bold tracking-[-0.01em]">
                        {member.name}
                      </h3>
                      {member.role?.trim() ? (
                        <p className="mt-1 text-[15px] font-medium text-teal">{member.role}</p>
                      ) : null}
                      {member.bio?.trim() ? (
                        <p className="mt-2.5 max-w-[30ch] text-[15px] text-muted">{member.bio}</p>
                      ) : null}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </SectionRow>
        ) : null}

        <SectionRow title="Équipement">
          <dl>
            {EQUIPMENT.map((item) => (
              <div
                key={item.category}
                className="grid grid-cols-[minmax(110px,190px)_minmax(0,1fr)] gap-4 border-b border-line py-4 first:border-t"
              >
                <dt className="text-[15px] text-muted">{item.category}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </SectionRow>
      </main>
      <ContactCta settings={settings} />
    </>
  );
}
