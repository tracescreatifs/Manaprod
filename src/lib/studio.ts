// Page Le studio immersive (D99) : constantes et calculs purs du mouvement,
// testés. Les sections lisent une progression de 0 à 1 calculée à partir du
// défilement de la page (jamais d'une mesure de mise en page à chaque image).

/** Photo d'ouverture de départ (dossier public, D06). */
export const STUDIO_HERO_DEFAULT = "/team/amath-ndiaye.jpg";

/** Chemin de la photo d'ouverture : celui des réglages, sinon la photo de départ. */
export function studioHeroSource(path: string | null | undefined): string {
  return path?.trim() || STUDIO_HERO_DEFAULT;
}

export const clamp = (x: number, min = 0, max = 1) => Math.min(max, Math.max(min, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/** Progression dans une section collante : 0 quand elle arrive en haut, 1 à sa fin. */
export function sectionProgress(scrollY: number, top: number, height: number, viewport: number): number {
  const run = height - viewport;
  if (run <= 0) return scrollY >= top ? 1 : 0;
  return clamp((scrollY - top) / run);
}

export type StoryState = {
  /** Part de l'anneau dessinée, de 0 à 1. */
  arc: number;
  /** Disque d'ombre arrivé en place, de 0 à 1. */
  disc: number;
  /** Point brillant, opacité de 0 à 1. */
  dot: number;
  /** Halo, opacité de 0 à 1. */
  halo: number;
  /** Phrase affichée (0, 1 ou 2). */
  line: number;
};

/** État du récit (maquette) pour une progression de 0 à 1. */
export function storyState(p: number): StoryState {
  return {
    arc: easeOut(clamp(p / 0.55)),
    disc: easeOut(clamp((p - 0.45) / 0.3)),
    dot: clamp((p - 0.72) / 0.08),
    halo: clamp((p - 0.72) / 0.15),
    line: Math.min(2, Math.max(0, Math.floor(p * 3.2))),
  };
}

/**
 * Rotations (en degrés) des deux demi-plans qui découvrent l'anneau, pour
 * une part dessinée de 0 à 1 : le premier balaie la moitié droite, le
 * second la moitié gauche. Transformations seulement (D99).
 */
export function ringRotations(arc: number): [number, number] {
  const angle = clamp(arc) * 360;
  return [Math.min(angle, 180) - 180, Math.max(angle - 180, 0)];
}

/** Panneau turquoise des chiffres : le 3e (maquette), ou un sur deux s'il y en a moins de 3. */
export function isLitePanel(index: number, count: number): boolean {
  return count >= 3 ? index === 2 : index % 2 === 1;
}

/** Position de défilement qui amène la carte d'équipe à l'écran (focus clavier). */
export function scrollForCard(
  cardLeft: number,
  cardWidth: number,
  overflow: number,
  viewportWidth: number,
  sectionTop: number,
  sectionRun: number,
): number {
  if (overflow <= 0 || sectionRun <= 0) return sectionTop;
  // Carte centrée si possible, dans les limites du défilement horizontal.
  const shift = clamp(cardLeft + cardWidth / 2 - viewportWidth / 2, 0, overflow);
  return sectionTop + (shift / overflow) * sectionRun;
}
