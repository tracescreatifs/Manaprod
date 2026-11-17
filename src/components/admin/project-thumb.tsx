import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import { youTubeThumbnailUrl } from "@/lib/youtube";

// Aperçu de la miniature d'un projet dans le dashboard : miniature
// téléversée, sinon celle de la première vidéo (règle du site), sinon les
// initiales du client. Images non optimisées (dashboard seulement).
export function ProjectThumb({
  thumbnailPath,
  videoId,
  client,
  sizes,
}: {
  thumbnailPath: string | null;
  videoId: string | null;
  client: string;
  sizes: string;
}) {
  const src = thumbnailPath ? mediaUrl(thumbnailPath) : videoId ? youTubeThumbnailUrl(videoId) : null;
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
