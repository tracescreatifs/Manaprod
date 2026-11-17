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
