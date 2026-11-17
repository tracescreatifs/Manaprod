// Informations fixes du site, qui ne sont pas en base (textes du prototype et
// navigation). Les coordonnées et la phrase du hero viennent de site_settings.

// Signature de l'agence, texte fixe du pied de page du prototype.
export const SIGNATURE = "C’est toujours celui qui éclaire qui demeure dans l’obscurité.";

// Navigation principale (en-tête et pied de page), dans l'ordre du prototype.
export const NAV_LINKS = [
  { href: "/realisations", label: "Réalisations" },
  { href: "/services", label: "Services" },
  { href: "/studio", label: "Le studio" },
  { href: "/contact", label: "Contact" },
] as const;

// Indexation du site par les moteurs de recherche (D92) : pilote la balise
// robots de toutes les pages publiques et robots.txt. Reste à false jusqu'à
// la mise en ligne (Prompt 14) ; le dashboard est en noindex dans tous les cas.
export const INDEXING_ENABLED = false;

export const SITE_NAME = "MANA PROD";

// Image de partage par défaut (logo empilé sur fond #0A1013, D93).
export const DEFAULT_SHARE_IMAGE = {
  url: "/partage-mana-prod.png",
  width: 1200,
  height: 630,
  alt: "Logo MANA PROD",
} as const;
