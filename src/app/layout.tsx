import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl } from "@/lib/env";
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
  // Site entier hors indexation jusqu'à la mise en ligne (décision D31).
  robots: {
    index: false,
    follow: false,
  },
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
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
