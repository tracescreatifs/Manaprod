import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { mediaUrl } from "@/lib/media";
import type { ShareSource } from "@/lib/share-source";
import { DEFAULT_SHARE_IMAGE } from "@/lib/site";

// Fabrication des images de partage des fiches (D103) : JPEG 1200 x 630,
// recadré au centre sans déformation (fit cover), moins de 300 Ko. Le JPEG
// est lu par toutes les plateformes (WhatsApp ignore souvent le WebP).

export const SHARE_SIZE = { width: 1200, height: 630 } as const;
const MAX_BYTES = 300 * 1024;
const FETCH_TIMEOUT = 8000;

/** Octets d'un fichier du dossier public (chemin commençant par « / »). */
function readPublic(path: string): Promise<Buffer> {
  return readFile(join(process.cwd(), "public", path));
}

/** Octets de l'image source, ou null si elle est introuvable (404 YouTube, fichier supprimé). */
async function loadSource(source: ShareSource): Promise<Buffer | null> {
  if (source.kind === "media" && source.path.startsWith("/")) return readPublic(source.path);
  const url = source.kind === "media" ? mediaUrl(source.path) : source.url;
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT), cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`image source inaccessible (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

/** JPEG de partage à partir d'une image quelconque (JPEG, PNG, WebP, AVIF). */
export async function toShareJpeg(input: Buffer): Promise<Uint8Array> {
  const resized = sharp(input, { failOn: "error" })
    .rotate()
    .resize(SHARE_SIZE.width, SHARE_SIZE.height, { fit: "cover", position: "centre" })
    .flatten({ background: "#0A1013" });
  for (const quality of [82, 72, 62]) {
    const out = await resized.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    if (out.length <= MAX_BYTES || quality === 62) return new Uint8Array(out);
  }
  throw new Error("compression impossible");
}

/** Première source disponible convertie en JPEG, ou null si aucune n'existe. */
export async function shareJpegFromSources(sources: ShareSource[]): Promise<Uint8Array | null> {
  for (const source of sources) {
    const bytes = await loadSource(source);
    if (bytes) return toShareJpeg(bytes);
  }
  return null;
}

/** Image de partage par défaut (logo, Prompt 13) convertie en JPEG. */
export async function defaultShareJpeg(): Promise<Uint8Array> {
  return toShareJpeg(await readPublic(DEFAULT_SHARE_IMAGE.url));
}
