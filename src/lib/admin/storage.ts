import "server-only";
import type { requireAdmin } from "@/lib/admin/auth";
import { isStaticPath } from "@/lib/admin/images";

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

const BUCKET = "media";

/**
 * Supprime des fichiers du bucket media (client à cookies, policies
 * is_admin). Les chemins statiques (« /team/... », dossier public, D06)
 * ne sont jamais envoyés au bucket. Un échec est consigné, jamais bloquant.
 */
export async function removeMediaFiles(supabase: Supabase, paths: (string | null | undefined)[]): Promise<void> {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))].filter((p) => !isStaticPath(p));
  if (unique.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(unique);
  if (error) console.error(`[MANA PROD] Dashboard : suppression de fichiers impossible (${error.message}).`);
}

/** Fichiers d'un dossier dont le nom commence par `prefix` (ex. « <id>- », ou tous avec « »). */
export async function listMediaFiles(supabase: Supabase, folder: string, prefix: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, { limit: 1000, ...(prefix ? { search: prefix } : {}) });
  if (error || !data) return [];
  return data.filter((f) => f.name.startsWith(prefix)).map((f) => `${folder}/${f.name}`);
}
