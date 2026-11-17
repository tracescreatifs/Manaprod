"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { discardStudioUpload, resetStudioHero, setStudioHero } from "@/app/admin/studio-actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ImageError, prepareImage, uploadImage } from "@/components/admin/image-upload";
import { Panel } from "@/components/admin/page-head";
import { Toast } from "@/components/admin/toast";
import { btnLine, btnSmall } from "@/components/admin/ui";
import { useFocusLater } from "@/components/admin/use-focus-later";
import { stamped, type ActionState } from "@/lib/admin/action-state";
import { PHOTO_MAX_SIDE, studioHeroPath } from "@/lib/admin/images";
import { mediaUrl } from "@/lib/media";
import { STUDIO_HERO_DEFAULT, studioHeroSource } from "@/lib/studio";
import { createClient } from "@/lib/supabase/client";

// Photo d'ouverture de la page Le studio (D99) : téléversement direct vers
// media/studio/, compression WebP 2400 px (repli JPEG), aperçu,
// remplacement, retour à la photo de départ. Enregistrée aussitôt.
export function StudioHeroPanel({ path, available }: { path: string | null; available: boolean }) {
  const ns = useId();
  const [current, setCurrent] = useState(studioHeroSource(path));
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<ActionState>({ status: "idle" });
  const input = useRef<HTMLInputElement>(null);
  const focusLater = useFocusLater();
  const notify = (state: ActionState) => setToast(stamped(state));
  const isDefault = current === STUDIO_HERO_DEFAULT;

  async function choose(file: File | undefined) {
    if (input.current) input.current.value = "";
    if (!file) return;
    setBusy("Compression de l’image");
    let uploaded: string | null = null;
    try {
      const image = await prepareImage(file, PHOTO_MAX_SIDE);
      uploaded = studioHeroPath(crypto.randomUUID(), image.ext);
      setBusy("Envoi en cours");
      await uploadImage(createClient(), uploaded, image);
      setBusy("Enregistrement");
      const result = await setStudioHero(uploaded);
      notify(result);
      if (result.status === "success" && result.path) setCurrent(result.path);
    } catch (error) {
      if (uploaded) await discardStudioUpload(uploaded).catch(() => undefined);
      notify({
        status: "error",
        message: error instanceof ImageError ? error.message : "L’envoi a échoué. Vérifiez la connexion et réessayez.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    setBusy("Retour à la photo de départ");
    const result = await resetStudioHero();
    setBusy(null);
    notify(result);
    if (result.status === "success") {
      setCurrent(STUDIO_HERO_DEFAULT);
      focusLater(`${ns}-choisir`);
    }
  }

  return (
    <Panel title="Photo d’ouverture du studio">
      {!available ? (
        <p role="status" className="text-sm text-muted">
          La base n’est pas encore prête pour ce réglage : la migration 0004 doit être exécutée dans Supabase. En attendant,
          la page Le studio affiche la photo de départ.
        </p>
      ) : (
        <div className="flex flex-wrap items-start gap-5">
          <div className="relative aspect-[16/10] w-[260px] max-w-full overflow-hidden border border-line bg-bg">
            <Image src={mediaUrl(current)} alt="" fill unoptimized sizes="260px" className="object-cover object-[center_20%]" />
          </div>
          <div className="min-w-0 flex-[1_1_260px]">
            <p className="mb-4 text-sm text-muted">
              {isDefault ? "Photo de départ : Amath NDIAYE." : "Photo personnalisée."} Grande image en haut de la page Le
              studio, assombrie, visible surtout à droite sur ordinateur. Réduite à {PHOTO_MAX_SIDE} px avant l’envoi.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <label
                className={`${btnLine} ${btnSmall} cursor-pointer has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-teal ${busy ? "pointer-events-none opacity-50" : ""}`}
              >
                <ImagePlus size={16} strokeWidth={1.8} aria-hidden="true" />
                {isDefault ? "Choisir une autre photo" : "Remplacer la photo"}
                <input
                  id={`${ns}-choisir`}
                  ref={input}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={Boolean(busy)}
                  onChange={(e) => choose(e.target.files?.[0])}
                />
              </label>
              {!isDefault ? (
                <ConfirmButton
                  question="Revenir à la photo de départ (Amath NDIAYE) ? La photo actuelle sera supprimée."
                  confirmLabel="Confirmer"
                  pendingLabel="Retour en cours"
                  pending={Boolean(busy)}
                  onConfirm={reset}
                  triggerClassName={`${btnLine} ${btnSmall}`}
                  trigger={
                    <>
                      <RotateCcw size={16} strokeWidth={1.8} aria-hidden="true" />
                      Revenir à la photo de départ
                    </>
                  }
                />
              ) : null}
            </div>
            <p role="status" className="mt-3 text-sm text-muted empty:hidden">
              {busy ?? ""}
            </p>
          </div>
        </div>
      )}
      <Toast state={toast} />
    </Panel>
  );
}
