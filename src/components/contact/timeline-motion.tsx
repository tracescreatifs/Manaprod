"use client";

import { useEffect } from "react";

// Frise « Et ensuite » (maquette .tl) : le tracé se dessine et les nœuds
// s'allument à l'apparition. Sans JavaScript ou avec mouvement réduit, la
// frise reste complète et statique (attribut data-tl-motion absent).
export function TimelineMotion({ targetId }: { targetId: string }) {
  useEffect(() => {
    const list = document.getElementById(targetId);
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    list.setAttribute("data-tl-motion", "");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          list.classList.add("is-in");
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(list);
    return () => {
      observer.disconnect();
      list.removeAttribute("data-tl-motion");
      list.classList.remove("is-in");
    };
  }, [targetId]);
  return null;
}
