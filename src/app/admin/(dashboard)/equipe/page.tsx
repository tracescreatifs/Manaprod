import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { getAdminTeam } from "@/lib/admin/people";
import { TeamManager } from "./team-manager";

export const metadata: Metadata = { title: "Équipe | Dashboard MANA PROD" };

async function TeamContent() {
  return <TeamManager initial={await getAdminTeam()} />;
}

export default function TeamPage() {
  return (
    <>
      <PageHead
        title="Équipe"
        lead="Les membres affichés sur la page « Le studio » : photo, nom, titre et une courte présentation (facultative)."
      />
      <Suspense fallback={<PanelLoading />}>
        <TeamContent />
      </Suspense>
    </>
  );
}
