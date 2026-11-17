import { describe, expect, it } from "vitest";
import {
  extractYouTubeId,
  youTubeEmbedUrl,
  youTubeFallbackThumbnailUrl,
  youTubeHeroEmbedUrl,
  youTubeThumbnailUrl,
} from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("extractYouTubeId : formats acceptés", () => {
  it.each([
    ["identifiant seul", ID],
    ["youtu.be", `https://youtu.be/${ID}`],
    ["youtu.be avec paramètres", `https://youtu.be/${ID}?si=abc&t=42`],
    ["watch", `https://www.youtube.com/watch?v=${ID}`],
    ["watch sans www", `https://youtube.com/watch?v=${ID}`],
    ["watch m.", `https://m.youtube.com/watch?v=${ID}`],
    ["watch music.", `https://music.youtube.com/watch?v=${ID}&feature=share`],
    ["watch avec autres paramètres avant", `https://www.youtube.com/watch?feature=shared&v=${ID}&t=10s`],
    ["watch sans protocole", `www.youtube.com/watch?v=${ID}`],
    ["watch en http", `http://www.youtube.com/watch?v=${ID}`],
    ["embed", `https://www.youtube.com/embed/${ID}`],
    ["embed avec paramètres", `https://www.youtube.com/embed/${ID}?start=5`],
    ["shorts", `https://www.youtube.com/shorts/${ID}`],
    ["shorts sans www", `https://youtube.com/shorts/${ID}?feature=share`],
    ["live", `https://www.youtube.com/live/${ID}`],
    ["v", `https://www.youtube.com/v/${ID}`],
    ["nocookie", `https://www.youtube-nocookie.com/embed/${ID}`],
    ["nocookie sans www", `https://youtube-nocookie.com/embed/${ID}?rel=0`],
    ["identifiant avec tiret et souligné", "a-B_c1D2e3F"],
  ])("%s", (_label, input) => {
    const expected = input === "a-B_c1D2e3F" ? "a-B_c1D2e3F" : ID;
    expect(extractYouTubeId(input)).toBe(expected);
  });

  it("ignore les espaces autour de l'entrée", () => {
    expect(extractYouTubeId(`   https://youtu.be/${ID}  `)).toBe(ID);
    expect(extractYouTubeId(`\n\t${ID} \n`)).toBe(ID);
  });
});

describe("extractYouTubeId : entrées refusées", () => {
  it.each([
    ["chaîne vide", ""],
    ["espaces seuls", "   "],
    ["identifiant trop court", "dQw4w9WgXc"],
    ["identifiant trop long", "dQw4w9WgXcQQ"],
    ["caractère interdit", "dQw4w9WgXc!"],
    ["espace interne", "dQw4w 9WgXcQ"],
    ["watch sans v", "https://www.youtube.com/watch?list=PL123"],
    ["watch avec v trop court", "https://www.youtube.com/watch?v=abc"],
    ["youtu.be identifiant trop long", `https://youtu.be/${ID}X`],
    ["embed sans identifiant", "https://www.youtube.com/embed/"],
    ["chemin inconnu", `https://www.youtube.com/playlist/${ID}`],
    ["chaîne YouTube", "https://www.youtube.com/@manaprod"],
    ["domaine non YouTube", `https://vimeo.com/${ID}`],
    ["domaine imitant YouTube", `https://youtube.com.example.org/watch?v=${ID}`],
    ["sous-domaine inconnu", `https://evil.youtube.com/watch?v=${ID}`],
    ["domaine contenant youtu.be", `https://notyoutu.be/${ID}`],
    ["protocole javascript", `javascript:alert("${ID}")`],
    ["protocole ftp", `ftp://youtu.be/${ID}`],
    ["texte libre", "ma vidéo préférée"],
  ])("%s", (_label, input) => {
    expect(extractYouTubeId(input)).toBeNull();
  });

  it("renvoie null pour null et undefined", () => {
    expect(extractYouTubeId(null)).toBeNull();
    expect(extractYouTubeId(undefined)).toBeNull();
  });
});

describe("URL générées", () => {
  it("lecteur standard en nocookie", () => {
    expect(youTubeEmbedUrl(ID)).toBe(
      `https://www.youtube-nocookie.com/embed/${ID}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`,
    );
  });

  it("lecteur standard sans autoplay par défaut", () => {
    expect(youTubeEmbedUrl(ID, {})).toBe(youTubeEmbedUrl(ID));
    expect(youTubeEmbedUrl(ID, { autoplay: false })).not.toContain("autoplay");
  });

  it("lecteur avec autoplay, sans couper le son", () => {
    const url = new URL(youTubeEmbedUrl(ID, { autoplay: true }));
    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.get("rel")).toBe("0");
    expect(url.searchParams.has("mute")).toBe(false);
  });

  it("lecteur du hero : muet, en boucle, sans contrôles", () => {
    const url = new URL(youTubeHeroEmbedUrl(ID));
    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe(`/embed/${ID}`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      iv_load_policy: "3",
      autoplay: "1",
      mute: "1",
      controls: "0",
      loop: "1",
      playlist: ID,
      disablekb: "1",
      fs: "0",
    });
  });

  it("miniatures maxresdefault et hqdefault", () => {
    expect(youTubeThumbnailUrl(ID)).toBe(`https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`);
    expect(youTubeFallbackThumbnailUrl(ID)).toBe(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
  });
});
