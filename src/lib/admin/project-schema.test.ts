import { describe, expect, it } from "vitest";
import { projectOrderSchema, projectSchema, projectYearMax, uploadedPhotosSchema, validate } from "./schemas";

const base = {
  client: "  UNICEF ",
  title: "Staff Team Awards",
  slug: "unicef-staff-team-awards",
  category: "Film institutionnel",
  year: "2026",
  description: "\r\nPremier paragraphe.\r\n\r\nDeuxième.  ",
  deliverables: ["Film de 3 min", "  ", "Teaser de 30 s"],
  featured: true,
  published: false,
  videos: [
    { url: "https://youtu.be/aqz-KE-bpKQ?si=x", title: "" },
    { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Version courte" },
  ],
  photos: [{ id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", alt: " Tournage " }],
};

describe("projectSchema", () => {
  it("nettoie et accepte un projet complet", () => {
    const r = validate(projectSchema, base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.client).toBe("UNICEF");
    expect(r.data.year).toBe(2026);
    expect(r.data.description).toBe("Premier paragraphe.\n\nDeuxième.");
    expect(r.data.deliverables).toEqual(["Film de 3 min", "Teaser de 30 s"]);
    expect(r.data.videos.map((v) => [v.youtubeId, v.title])).toEqual([
      ["aqz-KE-bpKQ", null],
      ["dQw4w9WgXcQ", "Version courte"],
    ]);
    expect(r.data.photos[0].alt).toBe("Tournage");
  });

  it("accepte un projet minimal (année, description, listes vides)", () => {
    const r = validate(projectSchema, { ...base, year: "", description: "", deliverables: [], videos: [], photos: [] });
    expect(r.ok).toBe(true);
    if (r.ok) expect([r.data.year, r.data.description]).toEqual([null, null]);
  });

  it("exige client et titre", () => {
    const r = validate(projectSchema, { ...base, client: " ", title: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors)).toEqual(expect.arrayContaining(["client", "title"]));
  });

  it("refuse un slug mal formé, une catégorie inconnue, une année hors plage", () => {
    const r = validate(projectSchema, { ...base, slug: "Mon Projet", category: "Clip", year: "1850" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors)).toEqual(expect.arrayContaining(["slug", "category", "year"]));
    const future = validate(projectSchema, { ...base, year: String(projectYearMax() + 1) });
    expect(future.ok).toBe(false);
  });

  it("refuse un lien qui n'est pas YouTube et un doublon", () => {
    const r = validate(projectSchema, {
      ...base,
      videos: [
        { url: "https://vimeo.com/1", title: "" },
        { url: "https://youtu.be/aqz-KE-bpKQ", title: "" },
        { url: "https://www.youtube.com/embed/aqz-KE-bpKQ", title: "" },
      ],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors["videos.0.url"]).toMatch(/YouTube/);
      expect(r.errors["videos.2.url"]).toMatch(/déjà dans la liste \(vidéo 2\)/);
      expect(r.errors["videos.1.url"]).toBeUndefined();
    }
  });

  it("refuse une ligne de vidéo vide", () => {
    const r = validate(projectSchema, { ...base, videos: [{ url: "", title: "" }] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors["videos.0.url"]).toMatch(/retirez la ligne/);
  });
});

describe("ordre et photos téléversées", () => {
  it("refuse un ordre avec doublon", () => {
    const id = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
    expect(projectOrderSchema.safeParse([id, id]).success).toBe(false);
    expect(projectOrderSchema.safeParse([id]).success).toBe(true);
  });
  it("exige des dimensions positives", () => {
    expect(uploadedPhotosSchema.safeParse([{ path: "p", width: 0, height: 10 }]).success).toBe(false);
    expect(uploadedPhotosSchema.safeParse([{ path: "p", width: 10, height: 10 }]).success).toBe(true);
  });
});
