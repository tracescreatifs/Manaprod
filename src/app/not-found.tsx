import type { Metadata } from "next";
import { NotFoundContent } from "@/components/pages/not-found-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Page introuvable | MANA PROD",
  description: "Cette page n’existe pas ou n’est pas encore disponible.",
};

// Page 404 personnalisée, pour toute adresse inconnue et pour une fiche
// projet inexistante. Rendue hors du groupe (site) : elle reprend donc
// elle-même l'en-tête et le pied de page du site.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <div id="contenu" tabIndex={-1} className="outline-none">
        <NotFoundContent />
      </div>
      <SiteFooter />
    </>
  );
}
