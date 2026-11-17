"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

export type HeroSlide = { src: string; caption: string | null };

const INTERVAL = 5000;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (notify: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};

// Fond de l'ouverture de la page Contact (maquette .slides, D101) : photos
// des coulisses en fondu toutes les 5 secondes avec un léger zoom lent,
// légende (texte alternatif) et indicateurs, bouton pause (contenu en
// mouvement automatique, WCAG 2.2.2), pause quand l'onglet est masqué.
// Mouvement réduit ou une seule photo : première photo fixe. La première
// image est prioritaire (LCP) ; sans JavaScript, elle reste affichée.
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "hidden",
    () => false,
  );

  const moving = slides.length > 1 && !reduced;
  const running = moving && !paused && !hidden;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [running, slides.length]);

  const current = reduced ? 0 : index;
  const caption = slides[current]?.caption;

  return (
    <>
      <div className="contact-slides" aria-hidden="true">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`contact-slide${i === current ? " is-on" : ""}`}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="100vw"
              {...(i === 0
                ? { preload: true, fetchPriority: "high" as const }
                : { loading: "lazy" as const })}
            />
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <div className="contact-cap">
          {caption ? (
            <span className="contact-cap__text" aria-hidden="true">
              {caption}
            </span>
          ) : null}
          <span className="contact-cap__bars" aria-hidden="true">
            {slides.map((slide, i) => (
              <i
                key={slide.src}
                className={i === current ? "is-on" : undefined}
              />
            ))}
          </span>
          {moving ? (
            <button
              type="button"
              className="round round--sm"
              aria-label={
                paused
                  ? "Reprendre le défilement des photos"
                  : "Mettre en pause le défilement des photos"
              }
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? (
                <Play size={18} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Pause size={18} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
