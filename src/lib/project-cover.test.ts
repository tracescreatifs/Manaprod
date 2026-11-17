import { describe, expect, it } from "vitest";
import { coverImagePath } from "./project-cover";

describe("coverImagePath", () => {
  it("préfère la miniature téléversée", () => {
    expect(coverImagePath({ thumbnailPath: "thumbs/a.webp", videoId: "aqz-KE-bpKQ", photoPath: "projects/p/1.webp" })).toBe("thumbs/a.webp");
  });
  it("laisse la place à la vidéo quand il n'y a pas de miniature", () => {
    expect(coverImagePath({ thumbnailPath: null, videoId: "aqz-KE-bpKQ", photoPath: "projects/p/1.webp" })).toBeNull();
  });
  it("utilise la première photo sans miniature ni vidéo", () => {
    expect(coverImagePath({ thumbnailPath: null, videoId: null, photoPath: "projects/p/1.webp" })).toBe("projects/p/1.webp");
  });
  it("renvoie null pour la carte typographique", () => {
    expect(coverImagePath({ thumbnailPath: null, videoId: null, photoPath: null })).toBeNull();
  });
});
