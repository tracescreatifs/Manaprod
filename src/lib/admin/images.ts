// Chemins des images d'un projet dans le bucket media, et calcul du
// redimensionnement avant envoi (fonctions pures, testées).

/** Grand côté maximal, en pixels. */
export const PHOTO_MAX_SIDE = 2400;
export const THUMBNAIL_MAX_SIDE = 1600;
export const IMAGE_QUALITY = 0.82;
/** Limite du bucket media (migration 0001). */
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** Logos des clients : grand côté maximal (cahier 7.3). */
export const LOGO_MAX_SIDE = 520;
/** Photos de l'équipe : largeur finale maximale, format 4:5 (cahier 7.4). */
export const TEAM_PHOTO_WIDTH = 1000;
export const TEAM_PHOTO_RATIO = 4 / 5;

export type ImageExtension = "webp" | "jpg" | "png";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const EXT = "(?:webp|jpg)";
const LOGO_EXT = "(?:webp|png)";

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

/** clients/<id du client>-<identifiant unique>.<ext> */
export function clientLogoPath(clientId: string, fileId: string, ext: ImageExtension): string {
  return `clients/${clientId}-${fileId}.${ext}`;
}

/** team/<id du membre>-<identifiant unique>.<ext> */
export function teamPhotoPath(memberId: string, fileId: string, ext: ImageExtension): string {
  return `team/${memberId}-${fileId}.${ext}`;
}

/** Vrai si le chemin est celui d'un logo de ce client (WebP, ou PNG pour la transparence). */
export function isClientLogoPath(clientId: string, path: string): boolean {
  return new RegExp(`^clients/${UUID}-${UUID}\\.${LOGO_EXT}$`).test(path) && path.startsWith(`clients/${clientId}-`);
}

/** Vrai si le chemin est celui d'une photo de ce membre dans le bucket. */
export function isTeamPhotoPath(memberId: string, path: string): boolean {
  return new RegExp(`^team/${UUID}-${UUID}\\.${EXT}$`).test(path) && path.startsWith(`team/${memberId}-`);
}

/** Vrai si le chemin désigne un fichier du dossier public (photos de départ, D06) : jamais supprimé du bucket. */
export function isStaticPath(path: string): boolean {
  return path.startsWith("/");
}

export type VerticalPosition = "haut" | "centre" | "bas";

/**
 * Zone à garder pour recadrer une image au rapport `ratio` (largeur sur
 * hauteur) : centrée horizontalement ; verticalement selon `position`
 * quand l'image est plus haute que le cadre.
 */
export function cropRect(
  width: number,
  height: number,
  ratio: number,
  position: VerticalPosition,
): { x: number; y: number; width: number; height: number } {
  if (width / height > ratio) {
    const w = Math.round(height * ratio);
    return { x: Math.round((width - w) / 2), y: 0, width: w, height };
  }
  const h = Math.round(width / ratio);
  const free = height - h;
  const y = position === "haut" ? 0 : position === "bas" ? free : Math.round(free / 2);
  return { x: 0, y, width, height: h };
}

/** Photos des coulisses : backstage/<identifiant unique>.<ext> (D99). */
export function backstagePath(fileId: string, ext: ImageExtension): string {
  return `backstage/${fileId}.${ext}`;
}

/** Photo d'ouverture du studio : studio/<identifiant unique>.<ext> (D99). */
export function studioHeroPath(fileId: string, ext: ImageExtension): string {
  return `studio/${fileId}.${ext}`;
}

export function isBackstagePath(path: string): boolean {
  return new RegExp(`^backstage/${UUID}\\.${EXT}$`).test(path);
}

export function isStudioHeroPath(path: string): boolean {
  return new RegExp(`^studio/${UUID}\\.${EXT}$`).test(path);
}
