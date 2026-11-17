import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

// Manifeste web (cahier 11) : nom, couleurs de la charte et icônes officielles
// (docs/reference/logo/icones/).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}, production audiovisuelle à Dakar`,
    short_name: SITE_NAME,
    description: "MANA PROD, agence de production audiovisuelle basée à Dakar.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1013",
    theme_color: "#0A1013",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icone-app-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
