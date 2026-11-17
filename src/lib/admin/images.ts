// Chemins des images d'un projet dans le bucket media, et calcul du
// redimensionnement avant envoi (fonctions pures, testées).

/** Grand côté maximal, en pixels. */
export const PHOTO_MAX_SIDE = 2400;
export const THUMBNAIL_MAX_SIDE = 1600;
export const IMAGE_QUALITY = 0.82;
/** Limite du bucket media (migration 0001). */
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export type ImageExtension = "webp" | "jpg";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const EXT = "(?:webp|jpg)";

/** projects/<id du projet>/<identifiant unique>.<ext> */
export function photoPath(projectId: string, fileId: string, ext: ImageExtension): string {
  return `projects/${projectId}/${fileId}.${ext}`;
}

/** thumbs/<id du projet>-<identifiant unique>.<ext> */
export function thumbnailPath(projectId: string, fileId: string, ext: ImageExtension): string {
  return `thumbs/${projectId}-${fileId}.${ext}`;
}

/** Vrai si le chemin est celui d'une photo de ce projet (aucun autre chemin accepté). */
export function isProjectPhotoPath(projectId: string, path: string): boolean {
  return new RegExp(`^projects/${projectId}/${UUID}\\.${EXT}$`).test(path) && new RegExp(`^projects/${UUID}/`).test(path);
}

/** Vrai si le chemin est celui d'une miniature de ce projet. */
export function isProjectThumbnailPath(projectId: string, path: string): boolean {
  return new RegExp(`^thumbs/${projectId}-${UUID}\\.${EXT}$`).test(path) && new RegExp(`^thumbs/${UUID}-`).test(path);
}

/** Dimensions finales : le grand côté ramené à `max` au plus, proportions gardées. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const ratio = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * ratio)), height: Math.max(1, Math.round(h * ratio)) };
}
