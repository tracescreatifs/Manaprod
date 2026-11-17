"use client";

import Image from "next/image";
import { useState } from "react";
import { youTubeFallbackThumbnailUrl, youTubeThumbnailUrl } from "@/lib/youtube";

// Miniature YouTube (cahier 10) : maxresdefault, avec repli automatique sur
// hqdefault si elle n'existe pas. Si aucune ne charge, rien n'est affiché
// (le fond du conteneur reste visible, jamais d'image cassée).
// Servie sans l'optimisation d'images de Vercel (décision D53) : le
// conteneur fixe le ratio, l'image remplit le cadre (CLS nul).
export function YouTubeThumbnail({
  videoId,
  sizes,
  className,
  eager = false,
}: {
  videoId: string;
  sizes: string;
  className?: string;
  /** Chargement immédiat (image principale visible dès l'ouverture). */
  eager?: boolean;
}) {
  const [step, setStep] = useState<"maxres" | "hq" | "none">("maxres");
  if (step === "none") return null;

  const src =
    step === "maxres" ? youTubeThumbnailUrl(videoId) : youTubeFallbackThumbnailUrl(videoId);

  return (
    <Image
      key={src}
      src={src}
      alt=""
      fill
      unoptimized
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "low"}
      className={className}
      onError={() => setStep(step === "maxres" ? "hq" : "none")}
    />
  );
}
