import "server-only";
import { requireAdmin } from "@/lib/admin/auth";
import type { ProjectCategory, Tables } from "@/types/database";

// Lectures de l'onglet Projets : client à cookies (session administrateur,
// RLS : projets publiés et brouillons), jamais mises en cache.

export type AdminProjectRow = {
  id: string;
  slug: string;
  client: string;
  title: string;
  category: ProjectCategory;
  year: number | null;
  published: boolean;
  featured: boolean;
  thumbnailPath: string | null;
  videoId: string | null;
  videoCount: number;
  photoCount: number;
};

export async function getAdminProjects(): Promise<AdminProjectRow[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, slug, client, title, category, year, published, featured, thumbnail_path, first_video:project_videos(youtube_id, position), videos:project_videos(count), photos:project_photos(count)",
    )
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .order("position", { referencedTable: "first_video", ascending: true })
    .limit(1, { referencedTable: "first_video" });
  if (error) throw new Error(`[MANA PROD] Dashboard : lecture des projets impossible (${error.message}).`);
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    client: row.client,
    title: row.title,
    category: row.category,
    year: row.year,
    published: row.published,
    featured: row.featured,
    thumbnailPath: row.thumbnail_path,
    videoId: row.first_video[0]?.youtube_id ?? null,
    videoCount: row.videos[0]?.count ?? 0,
    photoCount: row.photos[0]?.count ?? 0,
  }));
}

export type AdminProject = Pick<
  Tables<"projects">,
  "id" | "slug" | "client" | "title" | "category" | "year" | "description" | "deliverables" | "featured" | "published" | "thumbnail_path"
> & {
  videos: Pick<Tables<"project_videos">, "id" | "youtube_url" | "youtube_id" | "title">[];
  photos: Pick<Tables<"project_photos">, "id" | "storage_path" | "alt" | "width" | "height">[];
};

export async function getAdminProject(id: string): Promise<AdminProject | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, slug, client, title, category, year, description, deliverables, featured, published, thumbnail_path, project_videos(id, youtube_url, youtube_id, title, position), project_photos(*)",
    )
    .eq("id", id)
    .order("position", { referencedTable: "project_videos", ascending: true })
    .order("position", { referencedTable: "project_photos", ascending: true })
    .maybeSingle();
  if (error) throw new Error(`[MANA PROD] Dashboard : lecture du projet impossible (${error.message}).`);
  if (!data) return null;
  const { project_videos, project_photos, ...project } = data;
  return {
    ...project,
    videos: project_videos.map(({ id: videoId, youtube_url, youtube_id, title }) => ({ id: videoId, youtube_url, youtube_id, title })),
    photos: project_photos.map(({ id: photoId, storage_path, alt, width, height }) => ({
      id: photoId,
      storage_path,
      alt,
      width: width ?? null,
      height: height ?? null,
    })),
  };
}
