import { describe, expect, it } from "vitest";
import { fitWithin, isProjectPhotoPath, isProjectThumbnailPath, photoPath, thumbnailPath } from "./images";

const P = "3f2b8c1e-0a4d-4c7e-9b1a-2d3e4f5a6b7c";
const F = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
const OTHER = "0f2b8c1e-0a4d-4c7e-9b1a-2d3e4f5a6b7c";

describe("chemins de stockage", () => {
  it("construit les chemins attendus", () => {
    expect(photoPath(P, F, "webp")).toBe(`projects/${P}/${F}.webp`);
    expect(thumbnailPath(P, F, "jpg")).toBe(`thumbs/${P}-${F}.jpg`);
  });
  it("accepte les chemins du projet", () => {
    expect(isProjectPhotoPath(P, photoPath(P, F, "webp"))).toBe(true);
    expect(isProjectThumbnailPath(P, thumbnailPath(P, F, "webp"))).toBe(true);
  });
  it("refuse les chemins d'un autre projet ou mal formés", () => {
    expect(isProjectPhotoPath(P, photoPath(OTHER, F, "webp"))).toBe(false);
    expect(isProjectPhotoPath(P, `projects/${P}/photo.webp`)).toBe(false);
    expect(isProjectPhotoPath(P, `projects/${P}/${F}.svg`)).toBe(false);
    expect(isProjectPhotoPath(P, `projects/${P}/../clients/${F}.webp`)).toBe(false);
    expect(isProjectPhotoPath(P, thumbnailPath(P, F, "webp"))).toBe(false);
    expect(isProjectThumbnailPath(P, photoPath(P, F, "webp"))).toBe(false);
    expect(isProjectThumbnailPath(P, thumbnailPath(OTHER, F, "webp"))).toBe(false);
    expect(isProjectPhotoPath("x.*", `projects/x.*/${F}.webp`)).toBe(false);
  });
});

describe("fitWithin", () => {
  it("réduit en gardant les proportions", () => {
    expect(fitWithin(4032, 3024, 2400)).toEqual({ width: 2400, height: 1800 });
    expect(fitWithin(3024, 4032, 2400)).toEqual({ width: 1800, height: 2400 });
    expect(fitWithin(6000, 1000, 1600)).toEqual({ width: 1600, height: 267 });
  });
  it("n'agrandit jamais une petite image", () => {
    expect(fitWithin(800, 600, 2400)).toEqual({ width: 800, height: 600 });
  });
});

import { clientLogoPath, cropRect, isClientLogoPath, isStaticPath, isTeamPhotoPath, teamPhotoPath } from "./images";

describe("chemins des logos et des photos de l'équipe", () => {
  it("construit et reconnaît les chemins", () => {
    expect(clientLogoPath(P, F, "png")).toBe(`clients/${P}-${F}.png`);
    expect(teamPhotoPath(P, F, "webp")).toBe(`team/${P}-${F}.webp`);
    expect(isClientLogoPath(P, clientLogoPath(P, F, "webp"))).toBe(true);
    expect(isClientLogoPath(P, clientLogoPath(P, F, "png"))).toBe(true);
    expect(isTeamPhotoPath(P, teamPhotoPath(P, F, "jpg"))).toBe(true);
  });
  it("refuse les chemins d'un autre élément, mal formés ou statiques", () => {
    expect(isClientLogoPath(P, clientLogoPath(OTHER, F, "webp"))).toBe(false);
    expect(isClientLogoPath(P, `clients/${P}-${F}.svg`)).toBe(false);
    expect(isClientLogoPath(P, `clients/${P}-${F}.jpg`)).toBe(false);
    expect(isTeamPhotoPath(P, teamPhotoPath(OTHER, F, "webp"))).toBe(false);
    expect(isTeamPhotoPath(P, "/team/babou.jpg")).toBe(false);
    expect(isTeamPhotoPath(P, `team/${P}-${F}.png`)).toBe(false);
  });
  it("reconnaît les fichiers du dossier public", () => {
    expect(isStaticPath("/team/babou.jpg")).toBe(true);
    expect(isStaticPath(teamPhotoPath(P, F, "webp"))).toBe(false);
  });
});

describe("cropRect (format 4:5)", () => {
  it("recadre une photo verticale selon la position choisie", () => {
    expect(cropRect(3024, 4032, 4 / 5, "haut")).toEqual({ x: 0, y: 0, width: 3024, height: 3780 });
    expect(cropRect(3024, 4032, 4 / 5, "centre")).toEqual({ x: 0, y: 126, width: 3024, height: 3780 });
    expect(cropRect(3024, 4032, 4 / 5, "bas")).toEqual({ x: 0, y: 252, width: 3024, height: 3780 });
  });
  it("centre horizontalement une photo paysage", () => {
    expect(cropRect(4032, 3024, 4 / 5, "haut")).toEqual({ x: 807, y: 0, width: 2419, height: 3024 });
  });
  it("garde une image déjà au bon format", () => {
    expect(cropRect(800, 1000, 4 / 5, "bas")).toEqual({ x: 0, y: 0, width: 800, height: 1000 });
  });
});

import { backstagePath, isBackstagePath, isStudioHeroPath, studioHeroPath } from "./images";

describe("chemins des coulisses et de la photo d'ouverture", () => {
  it("construit et reconnaît les chemins", () => {
    expect(backstagePath(F, "webp")).toBe(`backstage/${F}.webp`);
    expect(studioHeroPath(F, "jpg")).toBe(`studio/${F}.jpg`);
    expect(isBackstagePath(backstagePath(F, "jpg"))).toBe(true);
    expect(isStudioHeroPath(studioHeroPath(F, "webp"))).toBe(true);
  });
  it("refuse les autres chemins", () => {
    expect(isBackstagePath(`backstage/${F}.png`)).toBe(false);
    expect(isBackstagePath(`backstage/../projects/${F}.webp`)).toBe(false);
    expect(isStudioHeroPath("/team/amath-ndiaye.jpg")).toBe(false);
    expect(isStudioHeroPath(backstagePath(F, "webp"))).toBe(false);
  });
});
