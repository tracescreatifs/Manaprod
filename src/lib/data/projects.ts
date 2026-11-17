import "server-only";
import { cacheTag } from "next/cache";
import { cachedRead, publicDataClient, supabaseError, unwrap, type Loaded } from "@/lib/data/source";
import { CACHE_TAGS, projectTag } from "@/lib/data/tags";
import type { ProjectCategory, Tables } from "@/types/database";

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
  /** Chemin de la première photo (par position), ou null (D84). */
  photoPath: string | null;
};

const HOME_FALLBACK_COUNT = 6;

async function loadHomeProjects(): Promise<Loaded<ProjectSummary[]>> {
  "use cache";
  cacheTag(CACHE_TAGS.projects);
  return cachedRead("des projets", async () => {
    const supabase = publicDataClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("projects")
      .select(
        "slug, client, title, category, year, thumbnail_path, featured, project_videos(youtube_id, position), first_photo:project_photos(storage_path, position)",
      )
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .order("position", { referencedTable: "project_videos", ascending: true })
      .limit(1, { referencedTable: "project_videos" })
      .order("position", { referencedTable: "first_photo", ascending: true })
      .limit(1, { referencedTable: "first_photo" });
    if (error) throw supabaseError(error.message);

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
        photoPath: row.first_photo[0]?.storage_path ?? null,
      } satisfies ProjectSummary,
    }));

    const featured = projects.filter((p) => p.featured);
    return (featured.length > 0 ? featured : projects.slice(0, HOME_FALLBACK_COUNT)).map(
      (p) => p.summary,
    );
  });
}

/**
 * Projets de la sélection de l'accueil (cahier 6.2, décision D23) : projets
 * publiés « à la une », triés par position puis date de création ; s'il n'y
 * en a aucun, les 6 premiers projets publiés. Une seule requête, avec la
 * première vidéo de chaque projet.
 */
export async function getHomeProjects(): Promise<ProjectSummary[]> {
  return unwrap(await loadHomeProjects());
}

/** Projet de la page Réalisations : carte, avec le nombre de vidéos et de photos. */
export type ProjectListItem = ProjectSummary & {
  videoCount: number;
  photoCount: number;
};

async function loadProjects(): Promise<Loaded<ProjectListItem[]>> {
  "use cache";
  cacheTag(CACHE_TAGS.projects);
  return cachedRead("des projets", async () => {
    const supabase = publicDataClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("projects")
      .select(
        "slug, client, title, category, year, thumbnail_path, first_video:project_videos(youtube_id, position), first_photo:project_photos(storage_path, position), videos:project_videos(count), photos:project_photos(count)",
      )
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .order("position", { referencedTable: "first_video", ascending: true })
      .limit(1, { referencedTable: "first_video" })
      .order("position", { referencedTable: "first_photo", ascending: true })
      .limit(1, { referencedTable: "first_photo" });
    if (error) throw supabaseError(error.message);

    return data.map((row) => ({
      slug: row.slug,
      client: row.client,
      title: row.title,
      category: row.category,
      year: row.year,
      thumbnailPath: row.thumbnail_path,
      videoId: row.first_video[0]?.youtube_id ?? null,
      photoPath: row.first_photo[0]?.storage_path ?? null,
      videoCount: row.videos[0]?.count ?? 0,
      photoCount: row.photos[0]?.count ?? 0,
    }));
  });
}

/**
 * Tous les projets publiés (page Réalisations), triés par position puis date
 * de création, avec la première vidéo et le nombre de vidéos et de photos.
 * Une seule requête.
 */
export async function getProjects(): Promise<ProjectListItem[]> {
  return unwrap(await loadProjects());
}

export type ProjectVideo = Pick<Tables<"project_videos">, "id" | "youtube_id" | "title">;
export type ProjectPhoto = Pick<Tables<"project_photos">, "id" | "storage_path" | "alt" | "width" | "height">;

export type ProjectDetail = Pick<
  Tables<"projects">,
  "slug" | "client" | "title" | "category" | "year" | "description" | "deliverables" | "thumbnail_path"
> & {
  videos: ProjectVideo[];
  photos: ProjectPhoto[];
};

async function loadProject(slug: string): Promise<Loaded<ProjectDetail | null>> {
  "use cache";
  cacheTag(CACHE_TAGS.projects, projectTag(slug));
  return cachedRead("du projet", async () => {
    const supabase = publicDataClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("projects")
      .select(
        "slug, client, title, category, year, description, deliverables, thumbnail_path, project_videos(id, youtube_id, title, position), project_photos(*)",
      )
      .eq("slug", slug)
      .eq("published", true)
      .order("position", { referencedTable: "project_videos", ascending: true })
      .order("position", { referencedTable: "project_photos", ascending: true })
      .maybeSingle();
    if (error) throw supabaseError(error.message);
    if (!data) return null;

    const { project_videos, project_photos, ...project } = data;
    return {
      ...project,
      videos: project_videos.map(({ id, youtube_id, title }) => ({ id, youtube_id, title })),
      // Photos lues avec « * » : la fiche fonctionne avant comme après la
      // migration 0003 (dimensions absentes : null, décision D57).
      photos: project_photos.map(({ id, storage_path, alt, width, height }) => ({
        id,
        storage_path,
        alt,
        width: width ?? null,
        height: height ?? null,
      })),
    };
  });
}

/** Un projet publié avec ses vidéos et ses photos (triées par position), ou null. */
export async function getProject(slug: string): Promise<ProjectDetail | null> {
  return unwrap(await loadProject(slug));
}

/**
 * Projet publié suivant dans l'ordre de la page Réalisations, en boucle
 * (après le dernier, le premier). Null s'il n'y a qu'un projet ou si le
 * projet n'est pas publié. Calculé à partir de getProjects() (mis en cache,
 * étiquette projects).
 */
export async function getNextProject(
  slug: string,
): Promise<Pick<ProjectSummary, "slug" | "client"> | null> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1 || projects.length < 2) return null;
  const next = projects[(index + 1) % projects.length];
  return { slug: next.slug, client: next.client };
}

export type SitemapProject = { slug: string; updatedAt: string };

async function loadSitemapProjects(): Promise<Loaded<SitemapProject[]>> {
  "use cache";
  cacheTag(CACHE_TAGS.projects);
  return cachedRead("des projets", async () => {
    const supabase = publicDataClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("projects")
      .select("slug, updated_at")
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw supabaseError(error.message);
    return data.map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
  });
}

/** Projets publiés pour le sitemap, avec leur date de dernière modification. */
export async function getSitemapProjects(): Promise<SitemapProject[]> {
  return unwrap(await loadSitemapProjects());
}
