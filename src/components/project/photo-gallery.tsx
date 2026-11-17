"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { trapTab } from "@/lib/focus-trap";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  /** Dimensions réelles (migration 0003), sinon null. */
  width: number | null;
  height: number | null;
};

// Dimensions de référence quand celles de la photo sont inconnues (D57).
const FALLBACK_WIDTH = 1800;
const FALLBACK_HEIGHT = 1200;

const SWIPE_THRESHOLD = 50;

// Photos du projet (cahier 6.4, prototype .photos) : maçonnerie 3 colonnes
// (2 puis 1 selon la largeur) et visionneuse en <dialog> natif : image en
// grand, compteur, précédente et suivante (boutons, flèches du clavier,
// balayage tactile), Échap, focus rendu à la vignette, défilement bloqué.
export function PhotoGallery({
  photos,
  label,
  eagerFirst = false,
}: {
  photos: GalleryPhoto[];
  label: string;
  /** Première photo chargée tout de suite (fiche sans vidéo : c'est l'image principale, LCP). */
  eagerFirst?: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openerRef = useRef<number | null>(null);
  const touchX = useRef<number | null>(null);

  const open = index !== null;
  const count = photos.length;
  const go = (step: number) =>
    setIndex((current) => (current === null ? null : (current + step + count) % count));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  const show = (i: number) => {
    openerRef.current = i;
    setIndex(i);
  };

  const close = () => dialogRef.current?.close();
  const current = index !== null ? photos[index] : null;

  return (
    <>
      <ul className="mt-7 columns-1 gap-x-[clamp(14px,1.6vw,24px)] min-[561px]:columns-2 min-[1001px]:columns-3">
        {photos.map((photo, i) => (
          <li key={photo.id} className="mb-[clamp(14px,1.6vw,24px)] break-inside-avoid">
            <button
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => show(i)}
              aria-label={`Agrandir la photo ${i + 1} sur ${count} : ${photo.alt}`}
              className="group block w-full overflow-hidden bg-bg-2"
            >
              <Image
                src={photo.src}
                alt=""
                width={photo.width ?? FALLBACK_WIDTH}
                height={photo.height ?? FALLBACK_HEIGHT}
                sizes="(min-width: 1001px) 33vw, (min-width: 561px) 50vw, 100vw"
                {...(eagerFirst && i === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
                className="h-auto w-full transition-transform duration-[600ms] group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={label}
        onClose={() => {
          setIndex(null);
          const opener = openerRef.current;
          if (opener !== null) thumbRefs.current[opener]?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          trapTab(event);
          if (event.key === "ArrowLeft") go(-1);
          if (event.key === "ArrowRight") go(1);
        }}
        onTouchStart={(event) => {
          touchX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchX.current;
          const end = event.changedTouches[0]?.clientX;
          touchX.current = null;
          if (start === null || end === undefined) return;
          const delta = end - start;
          if (Math.abs(delta) > SWIPE_THRESHOLD) go(delta < 0 ? 1 : -1);
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none place-items-center bg-[rgba(4,8,10,0.95)] p-[clamp(16px,4vw,56px)] text-text backdrop:bg-transparent open:grid"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer la visionneuse"
          autoFocus
          className="absolute top-4 right-4 z-10 grid size-12 place-items-center border border-line bg-bg-2 transition-colors hover:border-teal hover:text-teal"
        >
          <X size={20} strokeWidth={1.8} />
        </button>

        {current ? (
          <div className="relative h-[min(85vh,calc(100dvh-120px))] w-full max-w-[1280px]">
            <Image
              key={current.id}
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        ) : null}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Photo précédente"
              className="absolute top-1/2 left-4 z-10 grid size-12 -translate-y-1/2 place-items-center border border-line bg-bg-2 transition-colors hover:border-teal hover:text-teal"
            >
              <ArrowLeft size={20} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Photo suivante"
              className="absolute top-1/2 right-4 z-10 grid size-12 -translate-y-1/2 place-items-center border border-line bg-bg-2 transition-colors hover:border-teal hover:text-teal"
            >
              <ArrowRight size={20} strokeWidth={1.8} />
            </button>
          </>
        ) : null}

        {index !== null ? (
          <p aria-live="polite" className="absolute inset-x-0 bottom-[18px] text-center text-sm text-muted">
            {index + 1} / {count}
          </p>
        ) : null}
      </dialog>
    </>
  );
}
