import "server-only";
import { cacheTag } from "next/cache";
import { cachedRead, publicDataClient, supabaseError, unwrap, type Loaded } from "@/lib/data/source";
import { CACHE_TAGS } from "@/lib/data/tags";
import type { Tables } from "@/types/database";

export type BackstagePhoto = Pick<Tables<"backstage_photos">, "id" | "storage_path" | "alt" | "width" | "height">;

/**
 * Table absente : migration 0004 pas encore exécutée (Vercel déploie dès le
 * push). La section des coulisses est alors simplement masquée (D99).
 */
export function isMissingTable(error: { code?: string | null; message: string }): boolean {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    (/backstage_photos/.test(error.message) && /not find|does not exist/i.test(error.message))
  );
}

async function loadBackstagePhotos(): Promise<Loaded<BackstagePhoto[]>> {
  "use cache";
  cacheTag(CACHE_TAGS.backstage);
  return cachedRead("des photos des coulisses", async () => {
    const supabase = publicDataClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("backstage_photos")
      .select("id, storage_path, alt, width, height")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      if (isMissingTable(error)) return [];
      throw supabaseError(error.message);
    }
    return data;
  });
}

/** Photos « Dans les coulisses » (page Le studio), triées par position. */
export async function getBackstagePhotos(): Promise<BackstagePhoto[]> {
  return unwrap(await loadBackstagePhotos());
}
