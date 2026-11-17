import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { getSiteUrl } from "@/lib/env";
import { INDEXING_ENABLED, SITE_NAME } from "@/lib/site";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  // Police variable : couvre toutes les graisses de 400 à 900.
  weight: "variable",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  title: "MANA PROD",
  description:
    "MANA PROD, agence de production audiovisuelle basée à Dakar : films institutionnels, spots, documentaires, motion design, drone.",
  // Indexation pilotée par une seule constante (D92, remplace D31) : false
  // jusqu'à la mise en ligne. Le dashboard reste en noindex (admin/layout).
  robots: INDEXING_ENABLED ? { index: true, follow: true } : { index: false, follow: false },
  applicationName: SITE_NAME,
};

export const viewport: Viewport = {
  themeColor: "#0A1013",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" className={schibsted.variable}>
      <body>
        {/* Sans JavaScript, les éléments animés s'affichent directement. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {/* Lien d'évitement : premier élément atteint au clavier. La cible
            #contenu est posée par chaque mise en page (site et dashboard). */}
        <a
          href="#contenu"
          className="sr-only z-50 bg-teal px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
