import { describe, expect, it } from "vitest";
import { mediaUrlFrom } from "./media";

const SUPABASE = "https://abcd.supabase.co";

describe("mediaUrlFrom", () => {
  it("garde un chemin du dossier public tel quel", () => {
    expect(mediaUrlFrom("/team/amath-ndiaye.jpg", SUPABASE)).toBe("/team/amath-ndiaye.jpg");
  });

  it("construit l'URL publique du bucket media", () => {
    expect(mediaUrlFrom("projects/42/photo-1.jpg", SUPABASE)).toBe(
      "https://abcd.supabase.co/storage/v1/object/public/media/projects/42/photo-1.jpg",
    );
  });

  it("ignore la barre finale de l'URL Supabase", () => {
    expect(mediaUrlFrom("thumbs/a.webp", `${SUPABASE}/`)).toBe(
      "https://abcd.supabase.co/storage/v1/object/public/media/thumbs/a.webp",
    );
  });

  it("encode les caractères spéciaux de chaque segment", () => {
    expect(mediaUrlFrom("clients/logo café #1.png", SUPABASE)).toBe(
      "https://abcd.supabase.co/storage/v1/object/public/media/clients/logo%20caf%C3%A9%20%231.png",
    );
  });
});
