import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import {
  StudioBackstage,
  StudioCta,
  StudioHero,
  StudioLanguages,
  StudioNumbers,
  StudioStory,
  StudioTeam,
} from "@/components/studio/studio-sections";
import { StudioMotion } from "@/components/studio/studio-motion";
import { getBackstagePhotos } from "@/lib/data/backstage";
import { getSiteSettings } from "@/lib/data/settings";
import { getTeam } from "@/lib/data/team";
import { mediaUrl } from "@/lib/media";
import { studioHeroSource } from "@/lib/studio";

export const metadata: Metadata = pageMetadata({
  title: "Le studio | Mana Prod",
  description:
    "MANA PROD, agence de production audiovisuelle basée à Dakar, portée par Amath NDIAYE : notre histoire, nos chiffres, nos langues, l’équipe et les coulisses.",
  path: "/studio",
});

const ROOT_ID = "studio";

// Page Le studio immersive (cahier 6.6, maquette validée, D99) : ouverture,
// récit de l'éclipse, chiffres, langues, équipe, coulisses, appel final.
// Page statique ; une section sans données est masquée. Avant la migration
// 0004, la photo de départ s'affiche et les coulisses sont masquées.
export default async function StudioPage() {
  const [settings, team, backstage] = await Promise.all([getSiteSettings(), getTeam(), getBackstagePhotos()]);
  const stats = (settings?.stats ?? []).filter((s) => s.value?.trim() && s.label?.trim());
  const heroPhoto = mediaUrl(studioHeroSource(settings?.studio_hero_path));

  return (
    <main id={ROOT_ID}>
      <StudioHero photo={heroPhoto} />
      <StudioStory />
      <StudioNumbers stats={stats} />
      <StudioLanguages />
      <StudioTeam team={team} />
      <StudioBackstage photos={backstage} />
      <StudioCta settings={settings} />
      <StudioMotion rootId={ROOT_ID} />
    </main>
  );
}
