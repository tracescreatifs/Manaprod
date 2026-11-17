import { siteContact, type SiteSettings } from "@/lib/data/settings";
import { getSiteUrl } from "@/lib/env";
import { SITE_NAME } from "@/lib/site";

// Données structurées Organization (cahier 11, D94), sur l'accueil :
// nom, URL, logo, téléphone et email lus dans les réglages, adresse à Dakar.
// Sans NEXT_PUBLIC_SITE_URL (build local), rien n'est émis.
export function OrganizationJsonLd({ settings }: { settings: SiteSettings | null }) {
  const site = getSiteUrl();
  if (!site) return null;
  const contact = siteContact(settings);
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: site.origin,
    logo: new URL("/icone-app-512.png", site).toString(),
    image: new URL("/partage-mana-prod.png", site).toString(),
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Dakar", addressCountry: "SN" },
  };
  // Bloc de données (non exécuté) ; « < » échappé pour ne jamais fermer la balise.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
