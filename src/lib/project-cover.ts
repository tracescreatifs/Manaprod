// Image de la carte d'un projet (D84) : miniature téléversée, sinon
// miniature de la première vidéo (affichée par la carte à partir de
// l'identifiant YouTube), sinon première photo, sinon carte typographique.

export type CoverSource = {
  thumbnailPath: string | null;
  videoId: string | null;
  /** Chemin de la première photo (par position), ou null. */
  photoPath: string | null;
};

/**
 * Chemin de l'image à afficher (miniature ou première photo), ou null quand
 * la carte doit utiliser la vidéo ou la carte typographique.
 */
export function coverImagePath({ thumbnailPath, videoId, photoPath }: CoverSource): string | null {
  if (thumbnailPath) return thumbnailPath;
  if (videoId) return null;
  return photoPath;
}
