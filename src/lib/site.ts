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
