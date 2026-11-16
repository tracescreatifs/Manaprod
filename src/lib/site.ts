// Informations fixes du site (cahier des charges, sections 1 et 5).
// Les coordonnées seront lues dans les réglages de la base à partir du
// Prompt 04 ; ces valeurs sont celles de la section 1 du cahier.

export const SIGNATURE = "C’est toujours celui qui éclaire qui demeure dans l’obscurité.";

export const CONTACT = {
  phone: "+221 78 011 43 08",
  phoneHref: "tel:+221780114308",
  email: "amathndiaye@manaprod.com",
  city: "Dakar, Sénégal",
} as const;

// Navigation principale (en-tête et pied de page), dans l'ordre du prototype.
export const NAV_LINKS = [
  { href: "/realisations", label: "Réalisations" },
  { href: "/services", label: "Services" },
  { href: "/studio", label: "Le studio" },
  { href: "/contact", label: "Contact" },
] as const;
