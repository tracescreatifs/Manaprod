import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { btnSolid } from "@/components/admin/ui";
import { UrlNotice } from "@/components/admin/url-notice";
import { getAdminProjects } from "@/lib/admin/projects";
import { ProjectList } from "./project-list";

export const metadata: Metadata = { title: "Projets | Dashboard MANA PROD" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function ProjectsContent({ searchParams }: { searchParams: SearchParams }) {
  const [projects, params] = await Promise.all([getAdminProjects(), searchParams]);
  return (
    <>
      {params.notification === "supprime" ? (
        <UrlNotice message="Projet supprimé, avec ses vidéos, ses photos et ses fichiers." />
      ) : null}
      <ProjectList initial={projects} />
    </>
  );
}

export default function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHead
        title="Projets"
        lead="Chaque projet a une miniature, une ou plusieurs vidéos YouTube et des photos. L’ordre ci-dessous est l’ordre du site."
      />
      <div className="mb-5">
        <Link href="/admin/projets/nouveau" className={btnSolid}>
          <Plus size={18} strokeWidth={1.8} aria-hidden="true" />
          Nouveau projet
        </Link>
      </div>
      <Suspense fallback={<PanelLoading />}>
        <ProjectsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
