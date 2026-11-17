// Textes fixes de la marque (cahier, section 9, et prototype
// docs/reference/manaprod-site.html, qui prime pour les textes : D18).
// Ils restent dans le code et non en base (décision D58).

export const SERVICES_INTRO =
  "De la captation à la livraison finale, nous maîtrisons toute la chaîne de production.";

export const SERVICES = [
  { title: "Production vidéo", text: "Films institutionnels, corporate, publicités, documentaires." },
  { title: "Motion design", text: "Animation 2D, génériques, spots didactiques." },
  { title: "Photographie", text: "Reportages, portraits corporate, photographie produit HD." },
  { title: "Communication digitale", text: "Stratégie de contenu, réseaux sociaux, campagnes." },
  { title: "Captation et événementiel", text: "Multi-caméras, couverture live, montage express." },
  { title: "Drone et direction artistique", text: "Prises de vue aériennes, identité de campagne." },
] as const;

export const METHOD_STEPS = [
  { title: "Brief", text: "Objectif, cible et ton. Un seul interlocuteur dès le départ." },
  { title: "Tournage", text: "Captation 4K, multi-caméras si besoin, lumière et son maîtrisés." },
  { title: "Post-production", text: "Montage, étalonnage, motion design. Validation à chaque étape." },
  { title: "Livraison", text: "Livrables aux formats demandés, dans les délais convenus." },
] as const;

export const WHY_MANA_PROD = [
  {
    title: "Qualité internationale, depuis Dakar",
    text: "Des productions aux standards des grandes agences, livrées localement.",
  },
  {
    title: "Un interlocuteur unique",
    text: "Du brief au livrable final, sans rupture créative ni intermédiaire.",
  },
  {
    title: "Réactivité et délais tenus",
    text: "Points de validation à chaque étape, retour garanti.",
  },
  {
    title: "Toute la chaîne maîtrisée",
    text: "Réalisation, montage, son, motion design, drone.",
  },
] as const;

// Page Le studio immersive (D99) : textes de la maquette validée par le
// client (docs/reference/mana-prod-studio-maquette.html). Un segment
// « em » s'affiche en turquoise.
export type StudioSegment = { text: string; em?: boolean };

export const STUDIO_HERO = {
  kicker: "Le studio",
  // Le dernier mot est en turquoise.
  title: ["Une", "signature", "visuelle", "forte."],
} as const;

export const STUDIO_STORY: { kicker: string; lines: StudioSegment[][] } = {
  kicker: "Qui sommes-nous",
  lines: [
    [
      { text: "MANA PROD", em: true },
      {
        text: " est une agence de production audiovisuelle basée à Dakar, portée par Amath NDIAYE, vidéaste et monteur professionnel.",
      },
    ],
    [
      { text: "Nous créons des contenus visuels qui " },
      { text: "marquent, émeuvent et restent", em: true },
      { text: ", pour des institutions internationales comme pour les marques les plus ambitieuses." },
    ],
    [
      {
        text: "De la captation à la livraison finale, nous maîtrisons toute la chaîne de production, avec une exigence créative totale et des ",
      },
      { text: "standards internationaux", em: true },
      { text: "." },
    ],
  ],
};

export const STUDIO_NUMBERS_KICKER = "En chiffres";

export const STUDIO_LANGUAGES = {
  kicker: "Nos langues",
  // Sens de glissement de chaque mot pendant le défilement.
  words: [
    { text: "Français.", dir: -1 },
    { text: "Wolof.", dir: 1 },
    { text: "English.", dir: -1 },
  ],
  lead: "La langue n’est pas une barrière.",
  text: "Nous travaillons en français, en wolof et en anglais, pour le public sénégalais, ouest-africain et international, avec la qualité des grandes agences, livrée depuis Dakar.",
} as const;

export const STUDIO_TEAM = { kicker: "L’équipe", title: "Ceux qui éclairent." } as const;

export const STUDIO_BACKSTAGE_TITLE = "Dans les coulisses.";

export const STUDIO_CTA = { kicker: "Un projet en tête ?", lines: ["Parlons de", "votre projet."] } as const;
