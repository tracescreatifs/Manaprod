import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { requireAdmin } from "@/lib/admin/auth";
import { ProjectEditor } from "../project-editor";

export const metadata: Metadata = { title: "Nouveau projet | Dashboard MANA PROD" };

async function NewProject() {
  await requireAdmin();
  return <ProjectEditor project={null} />;
}

export default function NewProjectPage() {
  return (
    <>
      <PageHead
        title="Nouveau projet"
        lead="Renseignez le projet et ses vidéos YouTube. La miniature et les photos s’ajoutent une fois le projet créé."
      />
      <Suspense fallback={<PanelLoading />}>
        <NewProject />
      </Suspense>
    </>
  );
}
