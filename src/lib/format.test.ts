import { describe, expect, it } from "vitest";
import { paragraphs, plural, truncate } from "./format";

describe("plural", () => {
  it("singulier pour 1, pluriel au-delà", () => {
    expect(plural(1, "vidéo")).toBe("1 vidéo");
    expect(plural(2, "vidéo")).toBe("2 vidéos");
    expect(plural(12, "photo")).toBe("12 photos");
    expect(plural(1, "projet")).toBe("1 projet");
    expect(plural(7, "projet")).toBe("7 projets");
  });
});

describe("truncate", () => {
  it("laisse un texte court intact", () => {
    expect(truncate("Un film court.", 50)).toBe("Un film court.");
  });

  it("coupe sur un mot avec des points de suspension", () => {
    const out = truncate("Film institutionnel réalisé pour les équipes de terrain au Sénégal", 40);
    expect(out.length).toBeLessThanOrEqual(40);
    expect(out.endsWith("…")).toBe(true);
    expect(out).toBe("Film institutionnel réalisé pour les…");
  });

  it("réduit les sauts de ligne et espaces multiples", () => {
    expect(truncate("Ligne un.\n\nLigne   deux.", 100)).toBe("Ligne un. Ligne deux.");
  });

  it("retire la ponctuation avant les points de suspension", () => {
    expect(truncate("Un tournage, deux jours, trois films", 15)).toBe("Un tournage…");
  });
});

describe("paragraphs", () => {
  it("sépare sur les sauts de ligne et ignore les lignes vides", () => {
    expect(paragraphs("Premier.\n\nDeuxième.\n  \nTroisième.")).toEqual([
      "Premier.",
      "Deuxième.",
      "Troisième.",
    ]);
  });

  it("renvoie une liste vide pour un texte vide ou null", () => {
    expect(paragraphs("")).toEqual([]);
    expect(paragraphs(null)).toEqual([]);
  });
});
