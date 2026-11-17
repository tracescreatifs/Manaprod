import { describe, expect, it } from "vitest";
import { PROJECT_CATEGORIES } from "@/types/database";
import { categoryFromSlug, categorySlug } from "./categories";

describe("categorySlug", () => {
  it("retire accents et espaces", () => {
    expect(categorySlug("Couverture événement")).toBe("couverture-evenement");
    expect(categorySlug("Campagne multi-supports")).toBe("campagne-multi-supports");
    expect(categorySlug("Film institutionnel")).toBe("film-institutionnel");
  });

  it("donne une valeur distincte pour chacune des 10 catégories", () => {
    const slugs = PROJECT_CATEGORIES.map(categorySlug);
    expect(new Set(slugs).size).toBe(PROJECT_CATEGORIES.length);
  });
});

describe("categoryFromSlug", () => {
  it("retrouve la catégorie parmi celles proposées", () => {
    expect(categoryFromSlug("documentaire", PROJECT_CATEGORIES)).toBe("Documentaire");
    expect(categoryFromSlug("couverture-evenement", PROJECT_CATEGORIES)).toBe(
      "Couverture événement",
    );
  });

  it("renvoie null pour une valeur inconnue, vide ou absente de la liste", () => {
    expect(categoryFromSlug("inconnue", PROJECT_CATEGORIES)).toBeNull();
    expect(categoryFromSlug("", PROJECT_CATEGORIES)).toBeNull();
    expect(categoryFromSlug(null, PROJECT_CATEGORIES)).toBeNull();
    expect(categoryFromSlug("documentaire", ["Film corporate"])).toBeNull();
  });
});
