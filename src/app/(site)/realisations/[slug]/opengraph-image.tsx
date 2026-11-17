import { getProjectShareImage } from "@/lib/data/share-image";
import { SHARE_SIZE } from "@/lib/share-image";

// Image de partage d'une fiche (D103) : JPEG 1200 x 630 construit à partir de
// l'image de sa carte (D84), image par défaut sinon. Next.js ajoute la balise
// og:image (avec type et dimensions) aux métadonnées de la fiche.
export const size = SHARE_SIZE;
export const contentType = "image/jpeg";
export const alt = "Projet réalisé par MANA PROD";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const jpeg = await getProjectShareImage(slug);
  return new Response(new Blob([jpeg as Uint8Array<ArrayBuffer>], { type: contentType }), {
    headers: { "Content-Type": contentType },
  });
}
