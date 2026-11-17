"use client";

import { useActionState, useState, startTransition, type FormEvent } from "react";
import { Info } from "lucide-react";
import { removeShowreel, saveShowreel } from "@/app/admin/actions";
import { Field, errorProps, inputClass } from "@/components/admin/field";
import { Panel } from "@/components/admin/page-head";
import { Toast } from "@/components/admin/toast";
import { btnDanger, btnSolid } from "@/components/admin/ui";
import { useClientCheck } from "@/components/admin/use-client-check";
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes";
import { idleState, type ActionState } from "@/lib/admin/action-state";
import { SHOWREEL_TITLE_MAX, showreelSchema, validate } from "@/lib/admin/schemas";
import { extractYouTubeId, youTubeEmbedUrl } from "@/lib/youtube";

type Saved = { url: string; title: string };

const latest = (a: ActionState, b: ActionState) => ((a.at ?? 0) >= (b.at ?? 0) ? a : b);

export function ShowreelForm({ initial }: { initial: Saved & { hasShowreel: boolean } }) {
  const [saveState, saveAction, saving] = useActionState(saveShowreel, idleState);
  const [removeState, removeAction, removing] = useActionState(removeShowreel, idleState);

  const [url, setUrl] = useState(initial.url);
  const [title, setTitle] = useState(initial.title);
  const [saved, setSaved] = useState<Saved & { hasShowreel: boolean }>(initial);
  const [handledAt, setHandledAt] = useState<number | undefined>(undefined);

  // Résultat serveur : la valeur enregistrée devient la référence.
  const last = latest(saveState, removeState);
  if (last.at !== handledAt) {
    setHandledAt(last.at);
    if (last.status === "success") {
      if (last === removeState) {
        setUrl("");
        setSaved({ url: "", title, hasShowreel: false });
      } else {
        setSaved({ url: url.trim(), title, hasShowreel: true });
      }
    }
  }

  const videoId = extractYouTubeId(url);
  const dirty = url.trim() !== saved.url || title !== saved.title;
  useUnsavedChanges(dirty);

  const { errors, toast, run, reset } = useClientCheck(last);
  const pending = saving || removing;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const check = validate(showreelSchema, { url, title });
    run(event, check.ok ? null : check.errors);
  }

  function onRemove() {
    if (!window.confirm("Retirer le showreel ? L’accueil affichera le fond de repli.")) return;
    reset();
    startTransition(() => removeAction());
  }

  return (
    <>
      <form action={saveAction} onSubmit={onSubmit} noValidate>
        <Panel title="Lien YouTube">
          <Field
            id="sr-url"
            label="Lien de la vidéo"
            error={errors.url}
            hint={url.trim() && !videoId && !errors.url ? "Lien non reconnu pour l’instant." : undefined}
          >
            <input
              id="sr-url"
              name="url"
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={inputClass}
              {...errorProps("sr-url", errors.url)}
            />
          </Field>
          <Field id="sr-title" label="Titre affiché sur le bouton" error={errors.title}>
            <input
              id="sr-title"
              name="title"
              maxLength={SHOWREEL_TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              {...errorProps("sr-title", errors.title)}
            />
          </Field>

          {videoId ? (
            <div className="relative mb-5 aspect-video w-full max-w-[560px] bg-black">
              <iframe
                key={videoId}
                src={youTubeEmbedUrl(videoId)}
                title="Aperçu du showreel"
                allow="encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 size-full border-0"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2.5">
            <button type="submit" disabled={pending} className={btnSolid}>
              {saving ? "Enregistrement en cours" : "Enregistrer"}
            </button>
            {saved.hasShowreel ? (
              <button type="button" onClick={onRemove} disabled={pending} className={btnDanger}>
                {removing ? "Retrait en cours" : "Retirer le showreel"}
              </button>
            ) : null}
          </div>
        </Panel>
      </form>

      <div className="mb-6 flex gap-3 border border-line bg-bg px-[18px] py-4 text-[15px] text-muted">
        <Info size={20} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
        <p>
          Conseil : mettez la vidéo en <b className="text-text">Publique</b> ou{" "}
          <b className="text-text">Non répertoriée</b> sur YouTube, et autorisez l’intégration. Une vidéo privée ne
          s’affichera pas.
        </p>
      </div>

      <Toast state={toast} />
    </>
  );
}
