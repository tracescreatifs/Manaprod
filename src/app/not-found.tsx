import { Suspense } from "react";
import type { Metadata } from "next";
import { NotFoundContent } from "@/components/pages/not-found-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Page introuvable | Mana Prod",
  description: "Cette page n’existe pas ou n’est pas encore disponible.",
  // Jamais indexée, même une fois l'indexation du site activée.
  robots: { index: false, follow: true },
};

// Page 404 personnalisée, pour toute adresse inconnue et pour une fiche
// projet inexistante. Rendue hors du groupe (site) : elle reprend donc
// elle-même l'en-tête et le pied de page du site.
export default function NotFound() {
  return (
    <>
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <div id="contenu" tabIndex={-1} className="outline-none">
        <NotFoundContent />
      </div>
      <SiteFooter />
    </>
  );
}
