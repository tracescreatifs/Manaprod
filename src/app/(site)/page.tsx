import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/button-link";
import { ContactCta } from "@/components/contact-cta";
import { ClientMarquee } from "@/components/home/client-marquee";
import { OrganizationJsonLd } from "@/components/organization-json-ld";
import { Hero } from "@/components/home/hero";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/project-card";
import { getClients } from "@/lib/data/clients";
import { getHomeProjects } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { mediaUrl } from "@/lib/media";
import { coverImagePath, type CoverSource } from "@/lib/project-cover";

/** URL de l'image de la carte (D84) : miniature, sinon première photo sans vidéo. */
function imageUrl(project: CoverSource): string | null {
  const path = coverImagePath(project);
  return path ? mediaUrl(path) : null;
}

export const metadata: Metadata = pageMetadata({
  title: "Mana Prod | Production audiovisuelle à Dakar",
  description:
    "MANA PROD, agence de production audiovisuelle basée à Dakar : films institutionnels, spots, documentaires, motion design, drone.",
  path: "/",
});

const filled = (value: string | null | undefined) => value?.trim() || null;

// Accueil complet (cahier 6.2, prototype) : hero, le studio, sélection,
// clients, appel final. Une section dont les données sont vides est masquée.
export default async function Home() {
  const [settings, projects, clients] = await Promise.all([
    getSiteSettings(),
    getHomeProjects(),
    getClients(),
  ]);

  return (
    <main>
      <OrganizationJsonLd settings={settings} />
      <Hero
        sub={filled(settings?.hero_sub)}
        title={filled(settings?.hero_title)}
        showreelId={filled(settings?.showreel_youtube_id)}
        showreelTitle={filled(settings?.showreel_title) ?? "Showreel"}
      />

      <section className="py-[clamp(64px,9vw,140px)]">
        <div className="wrap">
          <Reveal className="grid gap-x-[clamp(32px,6vw,120px)] gap-y-6 py-[clamp(40px,5vw,76px)] min-[821px]:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
            <h2 className="text-[clamp(20px,1.8vw,26px)] leading-[1.05] font-bold tracking-[-0.01em]">
              Le studio
            </h2>
            <div>
              <p className="text-[clamp(22px,2.3vw,34px)] leading-[1.28] font-medium tracking-[-0.01em] text-pretty">
                Agence de production audiovisuelle à Dakar, portée par Amath NDIAYE, vidéaste et
                monteur professionnel. Nous réalisons des films institutionnels, des spots, des
                documentaires et des couvertures d’événements, de la captation à la livraison
                finale.
              </p>
              <p className="mt-7">
                <ButtonLink href="/studio">Découvrir le studio</ButtonLink>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="pb-[clamp(64px,9vw,140px)]">
          <div className="wrap">
            <Reveal className="mb-[clamp(28px,4vw,56px)] flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
              <h2 className="text-[clamp(28px,3.4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.03em]">
                Sélection
              </h2>
              <ButtonLink href="/realisations">Toutes les réalisations</ButtonLink>
            </Reveal>
            <ul className="grid grid-cols-1 items-start gap-x-[clamp(16px,2vw,32px)] gap-y-[clamp(40px,5vw,80px)] min-[821px]:grid-cols-2">
              {projects.map((project) => (
                <li key={project.slug} className="min-w-0">
                  <Reveal>
                    <ProjectCard
                      sizes="(min-width: 821px) 50vw, 100vw"
                      project={{
                        slug: project.slug,
                        client: project.client,
                        title: project.title,
                        category: project.category,
                        year: project.year,
                        imageUrl: imageUrl(project),
                        videoId: project.videoId,
                      }}
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {clients.length > 0 ? (
        <section className="pb-[clamp(64px,9vw,140px)]">
          <div className="wrap">
            <Reveal className="mb-[clamp(28px,4vw,56px)]">
              <h2 className="text-[clamp(28px,3.4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.03em]">
                Ils nous font confiance
              </h2>
            </Reveal>
          </div>
          <Reveal>
            <ClientMarquee clients={clients} />
          </Reveal>
        </section>
      ) : null}

      <ContactCta settings={settings} />
    </main>
  );
}
