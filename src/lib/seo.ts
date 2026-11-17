import type { Metadata } from "next";
import { DEFAULT_SHARE_IMAGE, SITE_NAME } from "@/lib/site";

// Métadonnées complètes d'une page publique (cahier 11, D93) : titre,
// description, URL canonique, Open Graph et carte Twitter. Les URL relatives
// deviennent absolues grâce à metadataBase (NEXT_PUBLIC_SITE_URL, layout racine).

export type ShareImage = { url: string; width?: number; height?: number; alt?: string };

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  /** Chemin de la page, commençant par « / ». */
  path: string;
  /**
   * Image de partage propre à la page, sinon l'image par défaut. false : aucune
   * image dans la configuration, l'image vient du fichier opengraph-image de
   * la route (fiches, D103) ; X reprend alors l'image Open Graph.
   */
  image?: ShareImage | null | false;
  type?: "website" | "article";
}): Metadata {
  const images = image === false ? undefined : [image ?? DEFAULT_SHARE_IMAGE];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      locale: "fr_FR",
      siteName: SITE_NAME,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}
