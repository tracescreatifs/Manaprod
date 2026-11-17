import "server-only";
import { cacheTag } from "next/cache";
import { cachedRead, publicDataClient, supabaseError, unwrap, type Loaded } from "@/lib/data/source";
import { CACHE_TAGS } from "@/lib/data/tags";
import type { Tables } from "@/types/database";

export type TeamMember = Pick<Tables<"team_members">, "id" | "name" | "role" | "bio" | "photo_path">;

async function loadTeam(): Promise<Loaded<TeamMember[]>> {
  "use cache";
  cacheTag(CACHE_TAGS.team);
  return cachedRead("de l'équipe", async () => {
    const supabase = publicDataClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name, role, bio, photo_path")
      .order("position", { ascending: true });
    if (error) throw supabaseError(error.message);
    return data;
  });
}

/** Membres de l'équipe (page Le studio), triés par position. */
export async function getTeam(): Promise<TeamMember[]> {
  return unwrap(await loadTeam());
}
