import { describe, expect, it } from "vitest";
import {
  isLitePanel,
  ringRotations,
  scrollForCard,
  sectionProgress,
  storyState,
  studioHeroSource,
  STUDIO_HERO_DEFAULT,
} from "./studio";

describe("studioHeroSource", () => {
  it("utilise la photo des réglages, sinon la photo de départ", () => {
    expect(studioHeroSource("studio/x.webp")).toBe("studio/x.webp");
    expect(studioHeroSource(null)).toBe(STUDIO_HERO_DEFAULT);
    expect(studioHeroSource(undefined)).toBe(STUDIO_HERO_DEFAULT);
    expect(studioHeroSource("  ")).toBe(STUDIO_HERO_DEFAULT);
  });
});

describe("sectionProgress", () => {
  it("va de 0 à 1 pendant la traversée de la section", () => {
    expect(sectionProgress(0, 1000, 3000, 1000)).toBe(0);
    expect(sectionProgress(2000, 1000, 3000, 1000)).toBe(0.5);
    expect(sectionProgress(5000, 1000, 3000, 1000)).toBe(1);
  });
  it("ne divise jamais par zéro", () => {
    expect(sectionProgress(10, 0, 800, 800)).toBe(1);
  });
});

describe("storyState", () => {
  it("dessine l'anneau, puis glisse le disque, puis allume le point", () => {
    expect(storyState(0)).toEqual({ arc: 0, disc: 0, dot: 0, halo: 0, line: 0 });
    const mid = storyState(0.5);
    expect(mid.arc).toBeGreaterThan(0.9);
    expect(mid.disc).toBeGreaterThan(0);
    expect(mid.dot).toBe(0);
    expect(storyState(1)).toEqual({ arc: 1, disc: 1, dot: 1, halo: 1, line: 2 });
  });
  it("change de phrase aux bons moments", () => {
    expect(storyState(0.3).line).toBe(0);
    expect(storyState(0.32).line).toBe(1);
    expect(storyState(0.63).line).toBe(2);
  });
});

describe("ringRotations", () => {
  it("balaie la moitié droite puis la moitié gauche", () => {
    expect(ringRotations(0)).toEqual([-180, 0]);
    expect(ringRotations(0.5)).toEqual([0, 0]);
    expect(ringRotations(0.75)).toEqual([0, 90]);
    expect(ringRotations(1)).toEqual([0, 180]);
  });
});

describe("isLitePanel", () => {
  it("met le 3e panneau en turquoise, ou un sur deux s'il y en a moins", () => {
    expect([0, 1, 2, 3].map((i) => isLitePanel(i, 4))).toEqual([false, false, true, false]);
    expect([0, 1].map((i) => isLitePanel(i, 2))).toEqual([false, true]);
    expect(isLitePanel(0, 1)).toBe(false);
  });
});

describe("scrollForCard", () => {
  it("amène la carte au centre, dans les limites du défilement", () => {
    expect(scrollForCard(0, 400, 1000, 1200, 5000, 2000)).toBe(5000);
    expect(scrollForCard(1600, 400, 1000, 1200, 5000, 2000)).toBe(7000);
    expect(scrollForCard(800, 400, 1000, 1200, 5000, 2000)).toBe(5800);
    expect(scrollForCard(800, 400, 0, 1200, 5000, 2000)).toBe(5000);
  });
});
