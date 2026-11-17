"use client";

import { useEffect, useRef } from "react";

const FOLLOW = 0.22;
const INTERACTIVE = "a, button, [data-cursor], label:has(input), summary";

// Curseur anneau du site public (maquette Contact, règle « rond pour ce
// qu'on touche », D101). Seulement avec une souris (hover et pointeur fin)
// et sans mouvement réduit ; le curseur natif reste visible. L'anneau suit
// la souris avec un léger retard et s'agrandit sur ce qui se clique. La
// boucle requestAnimationFrame ne tourne que pendant un mouvement ; seules
// transform et opacity changent à chaque image. Décoratif (aria-hidden).
export function CursorRing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ref.current;
    if (!ring) return;
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop: (() => void) | null = null;

    const start = () => {
      let x = 0;
      let y = 0;
      let cx = 0;
      let cy = 0;
      let frame = 0;
      let seen = false;

      const tick = () => {
        cx += (x - cx) * FOLLOW;
        cy += (y - cy) * FOLLOW;
        ring.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        frame =
          Math.abs(x - cx) + Math.abs(y - cy) > 0.2
            ? requestAnimationFrame(tick)
            : 0;
      };
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        x = event.clientX;
        y = event.clientY;
        if (!seen) {
          // Première position : l'anneau apparaît sous la souris, sans glisser depuis le coin.
          seen = true;
          cx = x;
          cy = y;
        }
        ring.dataset.on = "";
        if (!frame) frame = requestAnimationFrame(tick);
      };
      const onOver = (event: PointerEvent) => {
        const target =
          event.target instanceof Element
            ? event.target.closest(INTERACTIVE)
            : null;
        ring.classList.toggle("is-big", Boolean(target));
      };
      const onLeave = () => {
        delete ring.dataset.on;
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        if (frame) cancelAnimationFrame(frame);
        delete ring.dataset.on;
        ring.classList.remove("is-big");
      };
    };

    const update = () => {
      stop?.();
      stop = pointer.matches && !reduce.matches ? start() : null;
    };
    update();
    pointer.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      stop?.();
      pointer.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="cursor-ring">
      <span />
    </div>
  );
}
