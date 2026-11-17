import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { UrlNotice } from "@/components/admin/url-notice";
import { getAdminSettings } from "@/lib/admin/settings";
import { ShowreelForm } from "./showreel-form";

export const metadata: Metadata = { title: "Showreel | Dashboard MANA PROD" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function ShowreelContent({ searchParams }: { searchParams: SearchParams }) {
  const [settings, params] = await Promise.all([getAdminSettings(), searchParams]);
  return (
    <>
      {params.notification === "mot-de-passe" ? <UrlNotice message="Mot de passe modifié." /> : null}
      <ShowreelForm
        initial={{
          url: settings.showreel_url ?? "",
          title: settings.showreel_title,
          hasShowreel: Boolean(settings.showreel_youtube_id),
        }}
      />
    </>
  );
}

export default function ShowreelPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHead
        title="Showreel"
        lead="La vidéo YouTube qui joue en arrière-plan de l’accueil (sans son). Les visiteurs peuvent la lancer avec le son depuis le bouton du hero."
      />
      <Suspense fallback={<PanelLoading />}>
        <ShowreelContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
