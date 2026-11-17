import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getProject } from "@/lib/data/projects";
import { CACHE_TAGS, projectTag } from "@/lib/data/tags";
import { defaultShareJpeg, shareJpegFromSources } from "@/lib/share-image";
import { shareImageSources } from "@/lib/share-source";

type Built = { ok: true; jpeg: Uint8Array | null } | { ok: false; message: string };

// Image de partage d'une fiche, mise en cache avec les étiquettes du projet
// (D103) : une nouvelle miniature, vidéo ou photo enregistrée dans le
// dashboard invalide l'étiquette et l'image est refaite à la demande
// suivante. Comme cachedRead (D69), une erreur n'est pas levée dans le
// cache : elle est renvoyée, mise en cache quelques secondes seulement.
async function buildProjectShareImage(slug: string): Promise<Built> {
  "use cache";
  cacheTag(CACHE_TAGS.projects, projectTag(slug));
  try {
    const project = await getProject(slug);
    const jpeg = project ? await shareJpegFromSources(shareImageSources(project)) : null;
    cacheLife("max");
    return { ok: true, jpeg };
  } catch (error) {
    cacheLife("seconds");
    return { ok: false, message: (error as Error).message };
  }
}

async function buildDefaultShareImage(): Promise<Uint8Array> {
  "use cache";
  cacheLife("max");
  return defaultShareJpeg();
}

/** JPEG de partage d'une fiche ; image par défaut sans image de carte ou en cas d'échec. */
export async function getProjectShareImage(slug: string): Promise<Uint8Array> {
  const built = await buildProjectShareImage(slug);
  if (!built.ok) {
    console.error(`[MANA PROD] Image de partage de « ${slug} » : ${built.message}. Image par défaut utilisée.`);
  }
  return (built.ok && built.jpeg) || buildDefaultShareImage();
}
