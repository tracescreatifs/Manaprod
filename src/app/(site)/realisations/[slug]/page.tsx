import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PhotoGallery } from "@/components/project/photo-gallery";
import { VideoFacade } from "@/components/project/video-facade";
import { getNextProject, getProject, getProjects } from "@/lib/data/projects";
import { paragraphs, truncate } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { youTubeThumbnailUrl } from "@/lib/youtube";

// Paramètre de validation : avec Cache Components, generateStaticParams doit
// renvoyer au moins une valeur. Utilisé seulement s'il n'y a aucun projet
// publié (build sans base) ; la page correspondante est une 404.
const NO_PROJECT = "aucun-projet";

// Type explicite (et non PageProps généré au build) : `npm run typecheck`
// doit réussir avant tout build.
type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  if (projects.length === 0) return [{ slug: NO_PROJECT }];
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Page introuvable | MANA PROD" };

  const title = `${project.title}, ${project.client} | Mana Prod`;
  const description = project.description?.trim()
    ? truncate(project.description, 160)
    : `Mana Prod pour ${project.client} : ${project.category}, « ${project.title} ».`;
  const image = project.thumbnail_path
    ? mediaUrl(project.thumbnail_path)
    : project.videos[0]
      ? youTubeThumbnailUrl(project.videos[0].youtube_id)
      : project.photos[0]
        ? mediaUrl(project.photos[0].storage_path)
        : null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

const subHeading = "text-[clamp(20px,1.8vw,26px)] leading-[1.05] font-bold tracking-[-0.01em]";
const row =
  "grid gap-x-[clamp(32px,6vw,120px)] gap-y-6 border-t border-line py-[clamp(40px,5vw,76px)] min-[821px]:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]";

// Fiche projet (cahier 6.4, prototype) : retour, titre, méta, vidéo
// principale, description, livrables, autres vidéos, photos, projet suivant.
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, next] = await Promise.all([getProject(slug), getNextProject(slug)]);
  if (!project) notFound();

  const [mainVideo, ...otherVideos] = project.videos;
  const description = paragraphs(project.description);
  const deliverables = project.deliverables.map((d) => d.trim()).filter(Boolean);
  const photos = project.photos.map((photo, i) => ({
    id: photo.id,
    src: mediaUrl(photo.storage_path),
    width: photo.width,
    height: photo.height,
    alt: photo.alt?.trim() || `Photo du projet ${project.title}${project.photos.length > 1 ? ` (${i + 1})` : ""}`,
  }));
  const empty = !mainVideo && photos.length === 0;

  return (
    <main className="wrap pt-[clamp(128px,14vw,210px)] pb-[clamp(72px,10vw,150px)]">
      <Link
        href="/realisations"
        className="mb-[clamp(28px,4vw,48px)] inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium text-muted transition-colors hover:text-teal"
      >
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.8} />
        Réalisations
      </Link>

      <h1 className="max-w-[14em] text-[clamp(36px,6.4vw,104px)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance">
        {project.title}
      </h1>

      <dl className="mt-[clamp(28px,4vw,48px)] flex flex-wrap gap-x-[clamp(32px,5vw,80px)] gap-y-4 border-t border-line pt-5">
        <div>
          <dt className="text-sm text-muted">Client</dt>
          <dd className="mt-0.5 font-semibold">{project.client}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Catégorie</dt>
          <dd className="mt-0.5 font-semibold">{project.category}</dd>
        </div>
        {project.year ? (
          <div>
            <dt className="text-sm text-muted">Année</dt>
            <dd className="mt-0.5 font-semibold">{project.year}</dd>
          </div>
        ) : null}
      </dl>

      {mainVideo ? (
        <div className="mt-[clamp(36px,5vw,64px)]">
          <VideoFacade
            main
            videoId={mainVideo.youtube_id}
            title={mainVideo.title}
            projectTitle={project.title}
          />
        </div>
      ) : null}

      {description.length > 0 ? (
        <Reveal className={`${row} mt-[clamp(36px,5vw,64px)]`}>
          <h2 className={subHeading}>Le projet</h2>
          <div className="grid gap-4">
            {description.map((text, i) => (
              <p key={i} className="max-w-[40em] text-[clamp(19px,1.6vw,22px)] text-[#C5D3D6]">
                {text}
              </p>
            ))}
          </div>
        </Reveal>
      ) : null}

      {deliverables.length > 0 ? (
        <Reveal className={`${row} ${description.length > 0 ? "" : "mt-[clamp(36px,5vw,64px)]"}`}>
          <h2 className={subHeading}>Livrables</h2>
          <ol className="max-w-[44em]">
            {deliverables.map((item, i) => (
              <li
                key={i}
                className="grid grid-cols-[44px_minmax(0,1fr)] gap-2 border-t border-line py-3.5 text-[19px] font-medium last:border-b"
              >
                <span aria-hidden="true" className="pt-1 text-sm font-bold text-teal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      ) : null}

      {otherVideos.length > 0 ? (
        <section aria-label="Autres vidéos" className="mt-[clamp(28px,3vw,44px)]">
          <ul className="grid grid-cols-1 gap-x-[clamp(16px,2vw,32px)] gap-y-[clamp(28px,3vw,44px)] min-[701px]:grid-cols-2">
            {otherVideos.map((video) => (
              <li key={video.id}>
                <VideoFacade
                  videoId={video.youtube_id}
                  title={video.title}
                  projectTitle={project.title}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {photos.length > 0 ? (
        <section className="mt-[clamp(56px,7vw,110px)]">
          <h2 className="text-[clamp(22px,2.2vw,30px)] leading-[1.05] font-bold tracking-[-0.02em]">
            Photos
          </h2>
          <PhotoGallery photos={photos} label={`Photos du projet ${project.title}`} />
        </section>
      ) : null}

      {empty ? (
        <p className="mt-12 border border-dashed border-line p-12 text-center text-muted">
          Les contenus de ce projet arrivent bientôt.
        </p>
      ) : null}

      {next ? (
        <Link
          href={`/realisations/${next.slug}`}
          className="group mt-[clamp(72px,9vw,150px)] block border-t border-line pt-8"
        >
          <span className="text-sm text-muted">Projet suivant</span>
          <span className="mt-3 block text-[clamp(32px,6vw,96px)] leading-none font-extrabold tracking-[-0.04em] transition-colors duration-[250ms] group-hover:text-teal">
            {next.client}
          </span>
        </Link>
      ) : null}
    </main>
  );
}
