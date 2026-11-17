import { describe, expect, it } from "vitest";
import { shareImageSources } from "./share-source";

const base = { thumbnail_path: null, videos: [], photos: [] };

describe("image de partage d'une fiche (règle D84)", () => {
  it("miniature téléversée en premier", () => {
    expect(
      shareImageSources({ ...base, thumbnail_path: "thumbs/a.webp", videos: [{ youtube_id: "abc" }], photos: [{ storage_path: "p.webp" }] }),
    ).toEqual([{ kind: "media", path: "thumbs/a.webp" }]);
  });
  it("puis la première vidéo, avec la miniature de repli", () => {
    expect(shareImageSources({ ...base, videos: [{ youtube_id: "abc" }, { youtube_id: "def" }], photos: [{ storage_path: "p.webp" }] })).toEqual([
      { kind: "url", url: "https://i.ytimg.com/vi/abc/maxresdefault.jpg" },
      { kind: "url", url: "https://i.ytimg.com/vi/abc/hqdefault.jpg" },
    ]);
  });
  it("puis la première photo, sinon rien (image par défaut)", () => {
    expect(shareImageSources({ ...base, photos: [{ storage_path: "projects/x/1.webp" }] })).toEqual([
      { kind: "media", path: "projects/x/1.webp" },
    ]);
    expect(shareImageSources(base)).toEqual([]);
  });
});
