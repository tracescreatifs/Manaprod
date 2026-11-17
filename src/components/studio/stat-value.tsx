"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";
import { parseStatValue } from "@/lib/format";

const DURATION = 1.3;

// Chiffre clé animé (cahier 4.5, prototype data-count) : de 0 à la valeur en
// 1,3 s quand l'élément est visible à 60 %, une seule fois. La valeur finale
// est rendue côté serveur et lue une seule fois par les lecteurs d'écran
// (copie masquée visuellement) ; le chiffre animé leur est masqué.
// Mouvement réduit ou valeur sans chiffre : valeur finale directe.
export function StatValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6, once: true });
  const parsed = parseStatValue(value);
  const target = parsed?.number;
  const suffix = parsed?.suffix ?? "";

  // Avant l'apparition : 0 et le reste de la valeur (sauf mouvement réduit).
  useEffect(() => {
    const el = ref.current;
    if (!el || target === undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!inView) {
      el.textContent = `0${suffix}`;
      return;
    }
    const controls = animate(0, target, {
      duration: DURATION,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (n) => {
        el.textContent = `${Math.round(n)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, target, suffix]);

  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
    </>
  );
}
