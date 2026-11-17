import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { dataError, publicDataClient } from "@/lib/data/source";
import { CACHE_TAGS } from "@/lib/data/tags";
import type { Tables } from "@/types/database";

export type TeamMember = Pick<Tables<"team_members">, "id" | "name" | "role" | "bio" | "photo_path">;

/** Membres de l'équipe (page Le studio), triés par position. */
export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheTag(CACHE_TAGS.team);
  cacheLife("max");

  const supabase = publicDataClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("team_members")
    .select("id, name, role, bio, photo_path")
    .order("position", { ascending: true });

  if (error) throw dataError("de l'équipe", error.message);
  return data;
}
