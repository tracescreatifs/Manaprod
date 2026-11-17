import { missingVariableError } from "@/lib/env";

// URL d'une image à partir d'un chemin stocké en base (décision D06) :
// - un chemin qui commence par « / » désigne un fichier du dossier public ;
// - sinon, un fichier du bucket Supabase « media » (URL publique).

export function mediaUrlFrom(path: string, supabaseUrl: string): string {
  if (path.startsWith("/")) return path;
  const base = supabaseUrl.replace(/\/+$/, "");
  const encoded = path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/media/${encoded}`;
}

/** Variante qui lit l'URL du projet Supabase dans l'environnement. */
export function mediaUrl(path: string): string {
  if (path.startsWith("/")) return path;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw missingVariableError("NEXT_PUBLIC_SUPABASE_URL");
  return mediaUrlFrom(path, supabaseUrl);
}
