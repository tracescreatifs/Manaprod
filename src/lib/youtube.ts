// Utilitaires YouTube (cahier des charges, section 10).
// Fonctions pures : aucune ne lève d'erreur, une entrée invalide renvoie null.

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

// Hôtes YouTube acceptés (avec ou sans www, m., music.).
const WATCH_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);
const NOCOOKIE_HOSTS = new Set(["youtube-nocookie.com", "www.youtube-nocookie.com"]);
const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

// Chemins de la forme /embed/ID, /shorts/ID, /live/ID, /v/ID.
const PATH_PREFIXES = new Set(["embed", "shorts", "live", "v"]);

function validId(value: string | null | undefined): string | null {
  return value && ID_PATTERN.test(value) ? value : null;
}

/**
 * Extrait l'identifiant de 11 caractères d'un lien YouTube, ou accepte
 * l'identifiant seul. Renvoie null pour toute autre entrée.
 */
export function extractYouTubeId(input: string | null | undefined): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  if (!value) return null;

  if (ID_PATTERN.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  if (SHORT_HOSTS.has(host)) {
    return segments.length === 1 ? validId(segments[0]) : null;
  }

  if (NOCOOKIE_HOSTS.has(host)) {
    return segments.length === 2 && segments[0] === "embed" ? validId(segments[1]) : null;
  }

  if (WATCH_HOSTS.has(host)) {
    if (segments.length === 1 && segments[0] === "watch") {
      return validId(url.searchParams.get("v"));
    }
    if (segments.length === 2 && PATH_PREFIXES.has(segments[0])) {
      return validId(segments[1]);
    }
  }

  return null;
}

const BASE_PARAMS = "rel=0&modestbranding=1&playsinline=1&iv_load_policy=3";

/** URL du lecteur youtube-nocookie.com (fiches projet, fenêtre modale). */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?${BASE_PARAMS}`;
}

/** URL du lecteur du hero : muet, en boucle, sans contrôles. */
export function youTubeHeroEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?${BASE_PARAMS}&autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&disablekb=1&fs=0`;
}

/** Miniature haute définition (peut ne pas exister pour certaines vidéos). */
export function youTubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

/** Miniature de repli, toujours disponible. */
export function youTubeFallbackThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
