import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { dataError, publicDataClient } from "@/lib/data/source";
import { CACHE_TAGS } from "@/lib/data/tags";
import type { ProjectCategory } from "@/types/database";

/** Projet tel qu'affiché dans une carte (accueil, puis réalisations). */
export type ProjectSummary = {
  slug: string;
  client: string;
  title: string;
  category: ProjectCategory;
  year: number | null;
  thumbnailPath: string | null;
  /** Identifiant YouTube de la première vidéo (par position), ou null. */
  videoId: string | null;
};

const HOME_FALLBACK_COUNT = 6;

/**
 * Projets de la sélection de l'accueil (cahier 6.2, décision D23) : projets
 * publiés « à la une », triés par position puis date de création ; s'il n'y
 * en a aucun, les 6 premiers projets publiés. Une seule requête, avec la
 * première vidéo de chaque projet.
 */
export async function getHomeProjects(): Promise<ProjectSummary[]> {
  "use cache";
  cacheTag(CACHE_TAGS.projects);
  cacheLife("max");

  const supabase = publicDataClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("projects")
    .select(
      "slug, client, title, category, year, thumbnail_path, featured, project_videos(youtube_id, position)",
    )
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .order("position", { referencedTable: "project_videos", ascending: true })
    .limit(1, { referencedTable: "project_videos" });

  if (error) throw dataError("des projets", error.message);

  const projects = data.map((row) => ({
    featured: row.featured,
    summary: {
      slug: row.slug,
      client: row.client,
      title: row.title,
      category: row.category,
      year: row.year,
      thumbnailPath: row.thumbnail_path,
      videoId: row.project_videos[0]?.youtube_id ?? null,
    } satisfies ProjectSummary,
  }));

  const featured = projects.filter((p) => p.featured);
  return (featured.length > 0 ? featured : projects.slice(0, HOME_FALLBACK_COUNT)).map(
    (p) => p.summary,
  );
}
