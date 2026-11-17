"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  cropRect,
  fitWithin,
  IMAGE_MAX_BYTES,
  IMAGE_QUALITY,
  type ImageExtension,
  type VerticalPosition,
} from "@/lib/admin/images";

// Préparation d'une image dans le navigateur avant l'envoi direct vers le
// bucket media (D79) : orientation corrigée, grand côté réduit, encodage
// WebP (JPEG, ou PNG pour garder la transparence des logos, si le
// navigateur ne sait pas encoder le WebP), qualité 0,82. Recadrage
// facultatif (photos de l'équipe au format 4:5, D86).

export type PreparedImage = { blob: Blob; width: number; height: number; ext: ImageExtension; type: string };

export class ImageError extends Error {}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, IMAGE_QUALITY));
}

export type PrepareOptions = {
  /** Grand côté maximal, en pixels. */
  maxSide?: number;
  /** Largeur finale maximale, en pixels (après recadrage). */
  maxWidth?: number;
  /** Recadrage au rapport largeur sur hauteur, position verticale du cadre. */
  crop?: { ratio: number; position: VerticalPosition };
  /** Format de repli si le WebP n'est pas disponible. */
  fallback?: "jpeg" | "png";
};

export async function prepareImage(file: File, options: number | PrepareOptions): Promise<PreparedImage> {
  const { maxSide, maxWidth, crop, fallback = "jpeg" } = typeof options === "number" ? { maxSide: options } : options;
  // Les photos HEIC d'iPhone arrivent parfois sans type : l'extension suffit.
  const looksLikeImage = file.type.startsWith("image/") || (!file.type && /\.(heic|heif)$/i.test(file.name));
  if (!looksLikeImage) {
    throw new ImageError("Ce fichier n’est pas une image. Choisissez une photo (JPEG, PNG, WebP ou HEIC).");
  }
  if (file.type === "image/svg+xml") {
    throw new ImageError("Les images SVG ne sont pas acceptées. Choisissez une photo (JPEG, PNG, WebP ou HEIC).");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("Cette image n’a pas pu être lue par le navigateur. Essayez un fichier JPEG ou PNG.");
  }

  const source = crop
    ? cropRect(bitmap.width, bitmap.height, crop.ratio, crop.position)
    : { x: 0, y: 0, width: bitmap.width, height: bitmap.height };
  let size = maxSide ? fitWithin(source.width, source.height, maxSide) : { width: source.width, height: source.height };
  if (maxWidth && size.width > maxWidth) {
    size = { width: maxWidth, height: Math.max(1, Math.round((size.height * maxWidth) / size.width)) };
  }
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new ImageError("Votre navigateur ne permet pas de préparer l’image. Essayez un autre navigateur.");
  }
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, source.x, source.y, source.width, source.height, 0, 0, size.width, size.height);
  bitmap.close();

  let blob = await encode(canvas, "image/webp");
  let ext: ImageExtension = "webp";
  if (!blob || blob.type !== "image/webp") {
    blob = await encode(canvas, fallback === "png" ? "image/png" : "image/jpeg");
    ext = fallback === "png" ? "png" : "jpg";
  }
  if (!blob) throw new ImageError("L’image n’a pas pu être compressée. Réessayez.");
  if (blob.size > IMAGE_MAX_BYTES) throw new ImageError("L’image reste trop lourde après compression (10 Mo au maximum).");
  return { blob, width: size.width, height: size.height, ext, type: blob.type };
}

/** Envoie l'image vers le bucket media (RLS : administrateurs uniquement). */
export async function uploadImage(supabase: SupabaseClient, path: string, image: PreparedImage): Promise<void> {
  const { error } = await supabase.storage.from("media").upload(path, image.blob, {
    contentType: image.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new ImageError("L’envoi a échoué. Vérifiez la connexion et réessayez.");
}
