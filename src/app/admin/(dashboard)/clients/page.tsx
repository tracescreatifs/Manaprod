import { Suspense } from "react";
import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { getAdminClients } from "@/lib/admin/people";
import { ClientsManager } from "./clients-manager";

export const metadata: Metadata = { title: "Clients | Dashboard MANA PROD" };

async function ClientsContent() {
  return <ClientsManager initial={await getAdminClients()} />;
}

export default function ClientsPage() {
  return (
    <>
      <PageHead
        title="Clients"
        lead="Les entreprises et institutions affichées sur l’accueil dans « Ils nous font confiance ». Ajoutez un logo, ou laissez-le vide pour afficher le nom en texte."
      />
      <div className="mb-6 flex gap-3 border border-line bg-bg px-[18px] py-4 text-[15px] text-muted">
        <Info size={20} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
        <p>
          Logo : <b className="text-text">PNG à fond transparent</b> recommandé (JPEG et WebP acceptés, SVG refusé), réduit
          à 520 px. Pour un logo sombre, cochez <b className="text-text">Afficher en blanc</b> : il restera lisible sur le
          fond noir du site. Les autres logos sont affichés en gris, et en couleur au survol.
        </p>
      </div>
      <Suspense fallback={<PanelLoading />}>
        <ClientsContent />
      </Suspense>
    </>
  );
}
