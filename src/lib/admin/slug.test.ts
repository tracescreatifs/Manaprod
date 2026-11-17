import { describe, expect, it } from "vitest";
import { projectSlug, SLUG_MAX, SLUG_PATTERN, slugify } from "./slug";

describe("slugify", () => {
  it("retire accents, majuscules et ponctuation", () => {
    expect(projectSlug("Réalités SN", "Réalités Sénégal")).toBe("realites-sn-realites-senegal");
    expect(projectSlug("SEN'EAU", "5e anniversaire")).toBe("sen-eau-5e-anniversaire");
    expect(projectSlug("Forhope", "Inauguration de « la maison des parents »")).toBe(
      "forhope-inauguration-de-la-maison-des-parents",
    );
    expect(slugify("Cœur  --  Ville")).toBe("coeur-ville");
  });
  it("renvoie une chaîne vide sans caractère utilisable", () => {
    expect(slugify("« » !!")).toBe("");
  });
  it("coupe les slugs trop longs à la fin d'un mot", () => {
    const slug = slugify("mot ".repeat(60));
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX);
    expect(SLUG_PATTERN.test(slug)).toBe(true);
  });
  it("produit toujours un slug valide", () => {
    for (const text of ["Kayel Café Lancement produit", "UNICEF Staff Team Awards", "a_b c"]) {
      expect(SLUG_PATTERN.test(slugify(text))).toBe(true);
    }
  });
});
