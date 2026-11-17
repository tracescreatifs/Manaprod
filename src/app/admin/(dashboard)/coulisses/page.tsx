import { Suspense } from "react";
import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { getAdminBackstage } from "@/lib/admin/people";
import { BackstageManager } from "./backstage-manager";

export const metadata: Metadata = { title: "Coulisses | Dashboard MANA PROD" };

async function BackstageContent() {
  const { photos, missing } = await getAdminBackstage();
  if (missing) {
    return (
      <p role="status" className="border border-line bg-bg-2 p-8 text-muted">
        La base n’est pas encore prête pour les coulisses : la migration 0004 doit être exécutée dans Supabase.
      </p>
    );
  }
  return <BackstageManager initial={photos} />;
}

export default function BackstagePage() {
  return (
    <>
      <PageHead
        title="Coulisses"
        lead="Les photos de tournage affichées sur la page « Le studio », dans la section « Dans les coulisses ». Sans photo, la section ne s’affiche pas."
      />
      <div className="mb-6 flex gap-3 border border-line bg-bg px-[18px] py-4 text-[15px] text-muted">
        <Info size={20} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
        <p>
          Plateaux, caméra, drone, montage : <b className="text-text">6 à 10 photos</b> suffisent. Elles sont réduites à
          2400 px et compressées avant l’envoi. L’ordre ci-dessous est l’ordre de la page.
        </p>
      </div>
      <Suspense fallback={<PanelLoading />}>
        <BackstageContent />
      </Suspense>
    </>
  );
}
