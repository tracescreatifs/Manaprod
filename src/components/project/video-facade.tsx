"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { YouTubeThumbnail } from "@/components/youtube-thumbnail";
import { youTubeEmbedUrl } from "@/lib/youtube";

// Façade vidéo (cahier 6.4 et 10, prototype .vid) : miniature et bouton play
// carré ; le clic remplace la façade par le lecteur youtube-nocookie avec
// autoplay, dans le même cadre 16:9 (aucun saut de mise en page).
export function VideoFacade({
  videoId,
  title,
  projectTitle,
  main = false,
}: {
  videoId: string;
  title: string | null;
  projectTitle: string;
  /** Vidéo principale : miniature chargée immédiatement. */
  main?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const label = title ? `Lire la vidéo : ${title}` : `Lire la vidéo du projet ${projectTitle}`;

  // Le bouton disparaît : le focus passe au lecteur pour le clavier.
  useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  return (
    <figure className="m-0">
      <div className="relative aspect-video overflow-hidden bg-bg-2">
        {playing ? (
          <iframe
            ref={frameRef}
            src={youTubeEmbedUrl(videoId, { autoplay: true })}
            title={title ?? `Vidéo du projet ${projectTitle}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={label}
            className="group absolute inset-0 block size-full"
          >
            <YouTubeThumbnail
              videoId={videoId}
              eager={main}
              sizes={main ? "(min-width: 1480px) 1352px, 100vw" : "(min-width: 701px) 50vw, 100vw"}
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.025]"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-[clamp(16px,2vw,28px)] left-[clamp(16px,2vw,28px)] grid size-16 place-items-center bg-text text-ink transition-colors duration-200 group-hover:bg-teal group-focus-visible:bg-teal"
            >
              <Play size={22} strokeWidth={1.8} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      {title ? <figcaption className="mt-3 text-[15px] text-muted">{title}</figcaption> : null}
    </figure>
  );
}
