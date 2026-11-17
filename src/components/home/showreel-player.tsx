"use client";

import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { youTubeEmbedUrl } from "@/lib/youtube";

// Bouton du hero (cahier 6.2) et fenêtre modale du showreel avec le son.
// Fenêtre modale native (<dialog>) : reste de la page inerte, Échap ferme.
// L'iframe n'existe que pendant l'ouverture : le son s'arrête à la fermeture.
export function ShowreelPlayer({ videoId, title }: { videoId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="group inline-flex min-h-11 items-center gap-[18px] text-left"
      >
        <span
          aria-hidden="true"
          className="grid size-[60px] shrink-0 place-items-center border border-text transition-colors duration-200 group-hover:bg-text group-hover:text-ink group-focus-visible:bg-text group-focus-visible:text-ink"
        >
          <Play size={20} strokeWidth={1.8} fill="currentColor" />
        </span>
        <span className="leading-[1.25] font-semibold">
          {title}
          <small className="block text-sm font-normal text-[#C5D3D6]">Lecture avec le son</small>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`${title}, lecture avec le son`}
        onClose={() => {
          setOpen(false);
          buttonRef.current?.focus();
        }}
        onClick={(event) => {
          // Clic hors de la vidéo (sur le fond de la fenêtre) : fermeture.
          if (event.target === event.currentTarget) close();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none place-items-center bg-[rgba(4,8,10,0.95)] p-[clamp(16px,4vw,56px)] text-text backdrop:bg-transparent open:grid"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer la vidéo"
          autoFocus
          className="absolute top-4 right-4 z-10 grid size-12 place-items-center border border-line bg-bg-2 transition-colors hover:border-teal hover:text-teal"
        >
          <X size={20} strokeWidth={1.8} />
        </button>
        {open ? (
          <div
            className="aspect-video max-h-[85vh] bg-black"
            style={{ width: "min(1280px, 100%, calc(85vh * 16 / 9))" }}
          >
            <iframe
              src={youTubeEmbedUrl(videoId, { autoplay: true })}
              title={`${title} (vidéo YouTube)`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="size-full border-0"
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
