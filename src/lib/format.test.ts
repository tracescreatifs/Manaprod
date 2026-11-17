import { describe, expect, it } from "vitest";
import { formatDateFr, initials, paragraphs, parseStatValue, plural, truncate } from "./format";

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

describe("parseStatValue", () => {
  it("sépare la partie numérique du reste", () => {
    expect(parseStatValue("20+")).toEqual({ number: 20, suffix: "+" });
    expect(parseStatValue("8+")).toEqual({ number: 8, suffix: "+" });
    expect(parseStatValue("4K")).toEqual({ number: 4, suffix: "K" });
    expect(parseStatValue("24h")).toEqual({ number: 24, suffix: "h" });
    expect(parseStatValue("150")).toEqual({ number: 150, suffix: "" });
  });

  it("ignore les espaces autour", () => {
    expect(parseStatValue(" 12 ans ")).toEqual({ number: 12, suffix: " ans" });
  });

  it("renvoie null sans chiffre en tête", () => {
    expect(parseStatValue("HD")).toBeNull();
    expect(parseStatValue("")).toBeNull();
    expect(parseStatValue("+20")).toBeNull();
  });
});

describe("initials", () => {
  it("prend la première lettre des deux premiers mots", () => {
    expect(initials("Amath NDIAYE")).toBe("AN");
    expect(initials("Sidy SARR")).toBe("SS");
    expect(initials("Babou")).toBe("B");
    expect(initials("  jean  paul  martin ")).toBe("JP");
  });

  it("renvoie M pour un nom vide", () => {
    expect(initials("")).toBe("M");
  });
});

describe("formatDateFr", () => {
  it("affiche une date en français sans décalage de fuseau", () => {
    expect(formatDateFr("2026-11-17")).toBe("17 novembre 2026");
    expect(formatDateFr("2027-01-01")).toBe("1 janvier 2027");
  });
});
