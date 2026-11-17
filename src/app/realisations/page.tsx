import type { Metadata } from "next";
import { ContactCta } from "@/components/contact-cta";
import { ProjectGrid } from "@/components/realisations/project-grid";
import { getProjects } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { plural } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { PROJECT_CATEGORIES } from "@/types/database";

export const metadata: Metadata = {
  title: "Réalisations | Mana Prod",
  description:
    "Films institutionnels, spots, documentaires et couvertures d’événements réalisés par MANA PROD, agence de production audiovisuelle à Dakar.",
};

// Page Réalisations (cahier 6.3, prototype) : titre, compteur, filtres par
// catégorie (seulement celles utilisées) et grille éditoriale.
export default async function RealisationsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()]);

  // Catégories utilisées, dans l'ordre de la liste officielle.
  const categories = PROJECT_CATEGORIES.filter((c) => projects.some((p) => p.category === c));

  return (
    <>
      <main className="wrap pt-[clamp(128px,14vw,210px)] pb-[clamp(72px,10vw,150px)]">
        <h1 className="text-[clamp(40px,6.8vw,112px)] leading-[0.98] font-extrabold tracking-[-0.035em]">
          Réalisations
        </h1>
        {projects.length > 0 ? (
          <>
            <p className="mt-5 text-muted">
              {plural(projects.length, "projet")} pour des institutions, des banques et des
              marques.
            </p>
            <ProjectGrid
              categories={categories}
              projects={projects.map((project) => ({
                slug: project.slug,
                client: project.client,
                title: project.title,
                category: project.category,
                year: project.year,
                imageUrl: project.thumbnailPath ? mediaUrl(project.thumbnailPath) : null,
                videoId: project.videoId,
                videoCount: project.videoCount,
                photoCount: project.photoCount,
              }))}
            />
          </>
        ) : null}
      </main>
      <ContactCta settings={settings} />
    </>
  );
}
