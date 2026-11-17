import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { z } from "@/lib/zod";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { btnLine } from "@/components/admin/ui";
import { UrlNotice } from "@/components/admin/url-notice";
import { getAdminProject } from "@/lib/admin/projects";
import { ProjectEditor } from "../project-editor";

export const metadata: Metadata = { title: "Modifier le projet | Dashboard MANA PROD" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function EditProject({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const project = z.uuid().safeParse(id).success ? await getAdminProject(id) : null;
  if (!project) {
    return (
      <>
        <PageHead title="Projet introuvable" lead="Ce projet n’existe pas ou a été supprimé." />
        <Link href="/admin/projets" className={btnLine}>
          Retour à la liste des projets
        </Link>
      </>
    );
  }
  return (
    <>
      <PageHead title="Modifier le projet" lead={`${project.client} : ${project.title}`} />
      {query.notification === "cree" ? (
        <UrlNotice message="Projet créé. Ajoutez maintenant la miniature et les photos." />
      ) : null}
      <ProjectEditor key={project.id} project={project} />
    </>
  );
}

export default function EditProjectPage(props: Props) {
  return (
    <Suspense fallback={<PanelLoading />}>
      <EditProject {...props} />
    </Suspense>
  );
}
