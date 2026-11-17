import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import { coverImagePath } from "@/lib/project-cover";
import { youTubeThumbnailUrl } from "@/lib/youtube";

// Aperçu de la miniature d'un projet dans le dashboard : miniature
// téléversée, sinon celle de la première vidéo, sinon la première photo
// (règle du site, D84), sinon les initiales du client. Images non optimisées (dashboard seulement).
export function ProjectThumb({
  thumbnailPath,
  videoId,
  photoPath,
  client,
  sizes,
}: {
  thumbnailPath: string | null;
  videoId: string | null;
  photoPath: string | null;
  client: string;
  sizes: string;
}) {
  const path = coverImagePath({ thumbnailPath, videoId, photoPath });
  const src = path ? mediaUrl(path) : videoId ? youTubeThumbnailUrl(videoId) : null;
  if (!src) {
    const initials = client
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
    return (
      <div aria-hidden="true" className="grid size-full place-items-center bg-bg-3 text-lg font-extrabold text-muted">
        {initials}
      </div>
    );
  }
  return <Image src={src} alt="" fill unoptimized sizes={sizes} className="object-cover" />;
}
