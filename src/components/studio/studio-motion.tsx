"use client";

import { useEffect } from "react";
import {
  clamp,
  easeOut,
  ringRotations,
  scrollForCard,
  sectionProgress,
  storyState,
} from "@/lib/studio";

const COUNT_DURATION = 1300;

type Box = { top: number; height: number };

// Mouvement de la page Le studio (maquette, D99). Un seul écouteur de
// défilement passif ; mises à jour en requestAnimationFrame, avec transform
// et opacity seulement. Les positions des sections sont mesurées au
// chargement et au redimensionnement, jamais à chaque image. Avec
// prefers-reduced-motion : rien n'est animé, la page reste à plat (seules
// les présentations de l'équipe se déplient).
export function StudioMotion({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.setAttribute("data-studio-js", "");

    // Équipe : présentation dépliée au clic ou à Entrée (bouton natif).
    const toggles = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-studio-card-toggle]"));
    const onToggle = (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      const card = button.closest("[data-studio-card]");
      const open = card?.classList.toggle("is-open") ?? false;
      button.setAttribute("aria-expanded", String(open));
    };
    toggles.forEach((b) => b.addEventListener("click", onToggle));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      return () => toggles.forEach((b) => b.removeEventListener("click", onToggle));
    }

    root.setAttribute("data-motion", "on");

    const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);
    const qa = <T extends Element>(selector: string) => Array.from(root.querySelectorAll<T>(selector));

    const story = q<HTMLElement>("[data-studio-story]");
    const ringA = q<SVGElement>("[data-studio-ring-a]");
    const ringB = q<SVGElement>("[data-studio-ring-b]");
    const disc = q<SVGElement>("[data-studio-disc]");
    const dot = q<SVGElement>("[data-studio-dot]");
    const halo = q<HTMLElement>("[data-studio-halo]");
    const lines = qa<HTMLElement>("[data-studio-line]");
    const progress = qa<HTMLElement>("[data-studio-progress]");

    const numbers = q<HTMLElement>("[data-studio-numbers]");
    const numbersTrack = q<HTMLElement>("[data-studio-numbers-track]");
    const numbersLabel = q<HTMLElement>("[data-studio-numbers-label]");
    const panels = qa<HTMLElement>("[data-studio-panel]");
    const counters = panels.map((panel) => panel.querySelector<HTMLElement>("[data-studio-count]"));
    const counted = new Set<number>();

    const lang = q<HTMLElement>("[data-studio-lang]");
    const words = qa<HTMLElement>("[data-studio-word]");

    const team = q<HTMLElement>("[data-studio-team]");
    const teamTrack = q<HTMLElement>("[data-studio-team-track]");

    // Compteurs : 0 jusqu'à l'entrée du panneau (valeur finale dans le HTML).
    counters.forEach((el) => {
      if (el) el.textContent = "0";
    });

    let vh = window.innerHeight;
    let vw = window.innerWidth;
    let storyBox: Box | null = null;
    let numbersBox: Box | null = null;
    let langBox: Box | null = null;
    let teamBox: Box | null = null;
    let teamOverflow = 0;
    let labelX = 0;
    let lastLine = -1;
    let lastLite = false;

    const box = (el: HTMLElement | null): Box | null => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height };
    };

    // Mesures (chargement, redimensionnement, polices et images chargées).
    function measure() {
      vh = window.innerHeight;
      vw = window.innerWidth;
      if (team && teamTrack) {
        teamOverflow = Math.max(0, teamTrack.scrollWidth - vw);
        team.style.setProperty("--team-scroll", `${teamOverflow}px`);
      }
      // Position du titre « En chiffres » : sa couleur suit le panneau qu'il recouvre.
      labelX = numbersLabel ? numbersLabel.offsetLeft + numbersLabel.offsetWidth / 2 : 0;
      storyBox = box(story);
      numbersBox = box(numbers);
      langBox = box(lang);
      teamBox = box(team);
    }

    function count(i: number) {
      const el = counters[i];
      if (counted.has(i) || !el) return;
      counted.add(i);
      const target = Number(el.dataset.studioCount);
      const start = performance.now();
      const tick = (now: number) => {
        const u = clamp((now - start) / COUNT_DURATION);
        el.textContent = String(Math.round(target * easeOut(u)));
        if (u < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    let queued = false;
    function frame() {
      queued = false;
      const y = window.scrollY;

      if (storyBox) {
        const s = storyState(sectionProgress(y, storyBox.top, storyBox.height, vh));
        const [a, b] = ringRotations(s.arc);
        if (ringA) ringA.style.transform = `rotate(${a}deg)`;
        if (ringB) ringB.style.transform = `rotate(${b}deg)`;
        // Disque d'ombre : glisse depuis le bas à gauche jusqu'à sa place.
        if (disc) disc.style.transform = `translate(${-94.83 * (1 - s.disc)}px, ${37.102 * (1 - s.disc)}px)`;
        if (dot) dot.style.opacity = String(s.dot);
        if (halo) halo.style.opacity = String(s.halo);
        if (s.line !== lastLine) {
          lastLine = s.line;
          lines.forEach((l, i) => {
            l.classList.toggle("is-on", i === s.line);
            l.classList.toggle("is-past", i < s.line);
          });
          progress.forEach((p, i) => p.classList.toggle("is-on", i <= s.line));
        }
      }

      if (numbersBox && numbersTrack && panels.length > 1) {
        const p = sectionProgress(y, numbersBox.top, numbersBox.height, vh);
        const n = panels.length;
        numbersTrack.style.transform = `translateX(${-p * (n - 1) * vw}px)`;
        const current = Math.min(n - 1, Math.floor(p * (n - 1) + labelX / vw));
        const lite = panels[current]?.classList.contains("is-lite") ?? false;
        if (lite !== lastLite) {
          lastLite = lite;
          numbersLabel?.classList.toggle("is-ink", lite);
        }
        if (numbersBox.top - y < vh * 0.5) {
          panels.forEach((_, i) => {
            if (p * (n - 1) - i > -0.95) count(i);
          });
        }
      } else if (numbersBox && panels.length === 1 && numbersBox.top - y < vh * 0.6) {
        count(0);
      }

      if (langBox) {
        const center = langBox.top - y + langBox.height / 2;
        const lp = clamp(1 - center / vh, -1, 2);
        words.forEach((w) => {
          const dir = Number(w.dataset.studioWord);
          w.style.transform = `translateX(${dir * (lp - 0.5) * -22}vw)`;
        });
      }

      if (teamBox && teamTrack) {
        const p = sectionProgress(y, teamBox.top, teamBox.height, vh);
        teamTrack.style.transform = `translateX(${-p * teamOverflow}px)`;
      }
    }

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      frame();
    };

    // Clavier : une carte de l'équipe qui reçoit le focus est amenée à l'écran.
    const onFocus = (event: FocusEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>("[data-studio-card]");
      if (!card || !teamBox || teamOverflow <= 0) return;
      const top = scrollForCard(card.offsetLeft, card.offsetWidth, teamOverflow, vw, teamBox.top, teamBox.height - vh);
      window.scrollTo({ top, behavior: "instant" });
    };
    teamTrack?.addEventListener("focusin", onFocus);

    // Mesure après application de la mise en page immersive.
    requestAnimationFrame(() => {
      measure();
      frame();
    });
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Passage en mouvement réduit pendant la visite : retour à plat.
    const onReduce = () => {
      if (!reduce.matches) return;
      root.removeAttribute("data-motion");
      window.removeEventListener("scroll", onScroll);
      [ringA, ringB, disc, numbersTrack, teamTrack, ...words].forEach((el) => {
        if (el) el.style.transform = "";
      });
      [dot, halo].forEach((el) => {
        if (el) el.style.opacity = "";
      });
      counters.forEach((el) => {
        if (el) el.textContent = el.dataset.studioCount ?? "";
      });
    };
    reduce.addEventListener("change", onReduce);

    return () => {
      toggles.forEach((b) => b.removeEventListener("click", onToggle));
      teamTrack?.removeEventListener("focusin", onFocus);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      reduce.removeEventListener("change", onReduce);
      root.removeAttribute("data-motion");
    };
  }, [rootId]);

  return null;
}
