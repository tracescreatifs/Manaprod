import { youTubeFallbackThumbnailUrl, youTubeThumbnailUrl } from "@/lib/youtube";

// Image de partage d'une fiche (D103) : même ordre que l'image de la carte
// (D84) : miniature téléversée, sinon miniature de la première vidéo, sinon
// première photo. Renvoie les sources à essayer dans l'ordre (chemin en base
// ou URL YouTube) ; vide : image de partage par défaut.

export type ShareSource = { kind: "media"; path: string } | { kind: "url"; url: string };

export function shareImageSources(project: {
  thumbnail_path: string | null;
  videos: { youtube_id: string }[];
  photos: { storage_path: string }[];
}): ShareSource[] {
  if (project.thumbnail_path) return [{ kind: "media", path: project.thumbnail_path }];
  const video = project.videos[0];
  if (video) {
    return [
      { kind: "url", url: youTubeThumbnailUrl(video.youtube_id) },
      { kind: "url", url: youTubeFallbackThumbnailUrl(video.youtube_id) },
    ];
  }
  const photo = project.photos[0];
  return photo ? [{ kind: "media", path: photo.storage_path }] : [];
}
