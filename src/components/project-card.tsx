"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { YouTubeThumbnail } from "@/components/youtube-thumbnail";
import { youTubeHeroEmbedUrl } from "@/lib/youtube";

const PREVIEW_DELAY = 450;
const PREVIEW_FADE_DELAY = 700;

export type ProjectCardData = {
  slug: string;
  client: string;
  title: string;
  category: string;
  year: number | null;
  /** URL de la miniature téléversée (thumbnail_path), déjà résolue. */
  imageUrl: string | null;
  /** Identifiant YouTube de la première vidéo. */
  videoId: string | null;
};

// Aperçu au survol seulement à la souris, sans mouvement réduit (cahier 10).
function canPreview() {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Carte projet (prototype .tile) : lien vers la fiche, miniature, titre et
// ligne « client, catégorie, année ». Miniature par ordre de priorité :
// image téléversée, miniature YouTube, sinon carte typographique.
export function ProjectCard({ project, sizes }: { project: ProjectCardData; sizes: string }) {
  const [preview, setPreview] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clearTimer, []);

  const onPointerEnter = (event: React.PointerEvent) => {
    if (!project.videoId || event.pointerType !== "mouse" || !canPreview()) return;
    clearTimer();
    timer.current = setTimeout(() => setPreview(true), PREVIEW_DELAY);
  };

  const onPointerLeave = () => {
    clearTimer();
    setPreview(false);
    setPreviewVisible(false);
  };

  const meta = [project.client, project.category, project.year].filter(Boolean).join(", ");

  return (
    <Link
      href={`/realisations/${project.slug}`}
      className="group block min-w-0 no-underline"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-2">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.035]"
          />
        ) : project.videoId ? (
          <YouTubeThumbnail
            videoId={project.videoId}
            sizes={sizes}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.035]"
          />
        ) : (
          <TypographicCover client={project.client} />
        )}

        {preview && project.videoId ? (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 overflow-hidden bg-black transition-opacity duration-500 ${
              previewVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <iframe
              src={youTubeHeroEmbedUrl(project.videoId)}
              title=""
              tabIndex={-1}
              allow="autoplay; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setTimeout(() => setPreviewVisible(true), PREVIEW_FADE_DELAY)}
              className="absolute top-1/2 left-1/2 aspect-video h-full w-auto -translate-x-1/2 -translate-y-1/2 scale-[1.06] border-0"
            />
          </div>
        ) : null}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3.5 left-3.5 z-10 inline-flex translate-y-1.5 items-center gap-2 bg-text px-3 py-[9px] text-[13px] leading-none font-semibold text-ink opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:hidden"
        >
          Voir le projet <ArrowRight size={14} strokeWidth={1.8} />
        </span>
      </div>

      <div className="mt-4">
        <h3 className="text-[clamp(18px,1.7vw,24px)] leading-[1.05] font-bold tracking-[-0.01em] transition-colors duration-200 group-hover:text-teal group-focus-visible:text-teal">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{meta}</p>
      </div>
    </Link>
  );
}

// Carte typographique sans image (prototype .ph) : fond sombre, symbole de
// lecture, nom du client. Décorative : le titre et le client sont repris
// sous la carte.
function TypographicCover({ client }: { client: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[linear-gradient(135deg,#10191D_0%,#1a2b32_100%)]"
    >
      <span className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center border border-[#35505a] text-[#4b6872]">
        <Play size={20} strokeWidth={1.8} />
      </span>
      <span className="absolute bottom-[clamp(12px,1.4vw,20px)] left-[clamp(14px,1.6vw,24px)] text-[clamp(20px,2.6vw,40px)] leading-none font-extrabold tracking-[-0.03em] text-[#35505a]">
        {client}
      </span>
    </div>
  );
}
