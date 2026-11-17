"use client";

import { useEffect, useState } from "react";
import { YouTubeThumbnail } from "@/components/youtube-thumbnail";
import { youTubeHeroEmbedUrl } from "@/lib/youtube";

const FADE_DELAY = 700;

type NetworkInformation = { saveData?: boolean };

// Vidéo de fond seulement sur écran large, sans mouvement réduit et sans
// économiseur de données (décision D48). Sinon, miniature avec voile sombre.
function wantsBackgroundVideo() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return (
    window.matchMedia("(min-width: 821px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    connection?.saveData !== true
  );
}

// Fond du hero avec showreel (cahier 6.2, section 10) : la miniature est
// affichée d'abord ; la vidéo muette en boucle n'est chargée qu'après
// l'hydratation et apparaît en fondu une fois prête. Décoratif.
export function HeroBackground({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!wantsBackgroundVideo()) return;
    const id = window.setTimeout(() => setVideo(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <YouTubeThumbnail videoId={videoId} sizes="100vw" className="object-cover" />
      {video ? (
        <iframe
          src={youTubeHeroEmbedUrl(videoId)}
          title=""
          tabIndex={-1}
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => window.setTimeout(() => setVideoReady(true), FADE_DELAY)}
          className={`pointer-events-none absolute top-1/2 left-1/2 h-[max(56.25vw,100vh)] w-[max(100vw,177.78vh)] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-1000 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
      {/* Voile sombre sur la miniature tant que la vidéo n'est pas affichée. */}
      <div
        className={`absolute inset-0 bg-[rgba(10,16,19,0.35)] transition-opacity duration-1000 ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
