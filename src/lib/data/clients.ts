import "server-only";
import { cacheTag } from "next/cache";
import { cachedRead, publicDataClient, supabaseError, unwrap, type Loaded } from "@/lib/data/source";
import { CACHE_TAGS } from "@/lib/data/tags";
import type { Tables } from "@/types/database";

export type Client = Pick<Tables<"clients">, "id" | "name" | "logo_path" | "logo_white">;

async function loadClients(): Promise<Loaded<Client[]>> {
  "use cache";
  cacheTag(CACHE_TAGS.clients);
  return cachedRead("des clients", async () => {
    const supabase = publicDataClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, logo_path, logo_white")
      .order("position", { ascending: true });
    if (error) throw supabaseError(error.message);
    return data;
  });
}

/** Clients du bandeau « Ils nous font confiance », triés par position. */
export async function getClients(): Promise<Client[]> {
  return unwrap(await loadClients());
}
