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

export const STUDIO_PRESENTATION = {
  lede: "Une signature visuelle forte.",
  paragraphs: [
    "MANA PROD est une agence de production audiovisuelle basée à Dakar, portée par Amath NDIAYE, vidéaste et monteur professionnel.",
    "Nous créons des contenus visuels qui marquent, émeuvent et restent, pour des institutions internationales comme pour les marques les plus ambitieuses. De la captation à la livraison finale, nous maîtrisons toute la chaîne de production avec une exigence créative totale et des standards internationaux.",
  ],
} as const;

export const LANGUAGES = {
  lede: "Des contenus pensés pour le public sénégalais et ouest-africain.",
  text: "Nous travaillons en français et en wolof, avec la qualité des grandes agences, livrée depuis Dakar.",
} as const;

export const EQUIPMENT = [
  { category: "Caméra", detail: "Sony FX3, Full Frame 4K cinématique" },
  { category: "Optiques", detail: "Série G Master (16-35, 24-70, 85 mm...)" },
  { category: "Stabilisation", detail: "DJI Ronin RS, plans dynamiques" },
  { category: "Aérien", detail: "Drone DJI, prises de vue aériennes" },
  { category: "Éclairage", detail: "Aputure 300 et 600, Amaran F22" },
  { category: "Son", detail: "Micros directionnels et cravates sans fil" },
  { category: "Post-production", detail: "DaVinci Resolve, Premiere Pro, After Effects" },
  { category: "Communication", detail: "Casque Hollyland, coordination d’équipe" },
] as const;
