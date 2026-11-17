import type { MetadataRoute } from "next";
import { getSitemapProjects } from "@/lib/data/projects";
import { getSiteUrl } from "@/lib/env";

// sitemap.xml (cahier 11, D92) : pages publiques et fiches publiées, en URL
// absolues à partir de NEXT_PUBLIC_SITE_URL. Lecture en cache avec
// l'étiquette projects : une publication dans le dashboard le met à jour.
const PAGES = ["/", "/realisations", "/services", "/studio", "/contact", "/mentions-legales"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  if (!site) return [];
  const url = (path: string) => new URL(path, site).toString();
  const projects = await getSitemapProjects();
  return [
    ...PAGES.map((path) => ({ url: url(path) })),
    ...projects.map((p) => ({ url: url(`/realisations/${p.slug}`), lastModified: p.updatedAt })),
  ];
}
