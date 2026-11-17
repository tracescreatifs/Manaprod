import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { dataError, publicDataClient } from "@/lib/data/source";
import { CACHE_TAGS } from "@/lib/data/tags";
import type { Tables } from "@/types/database";

export type Client = Pick<Tables<"clients">, "id" | "name" | "logo_path" | "logo_white">;

/** Clients du bandeau « Ils nous font confiance », triés par position. */
export async function getClients(): Promise<Client[]> {
  "use cache";
  cacheTag(CACHE_TAGS.clients);
  cacheLife("max");

  const supabase = publicDataClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, logo_path, logo_white")
    .order("position", { ascending: true });

  if (error) throw dataError("des clients", error.message);
  return data;
}
