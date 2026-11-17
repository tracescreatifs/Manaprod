"use client";

import { useState, useTransition } from "react";
import { Check, Mail, RotateCcw, Trash2 } from "lucide-react";
import { deleteMessage, setMessageHandled } from "@/app/admin/message-actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Toast } from "@/components/admin/toast";
import { btnDanger, btnLine, btnSmall } from "@/components/admin/ui";
import { stamped, type ActionState } from "@/lib/admin/action-state";
import type { ContactMessage } from "@/lib/admin/messages";
import { formatMessageDate } from "@/lib/format";

const REPLY_SUBJECT = "Votre demande à MANA PROD";

// Liste des messages (cahier 7.6) : texte affiché tel quel (sauts de ligne
// conservés, aucun HTML interprété), actions traité, répondre, supprimer.
// Après chaque action, la Server Action rafraîchit la page et le compteur.
export function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const [toast, setToast] = useState<ActionState>({ status: "idle" });
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function run(id: string, action: () => Promise<ActionState>) {
    setBusy(id);
    startTransition(async () => {
      const result = await action();
      setToast(stamped(result));
      setBusy(null);
    });
  }

  if (messages.length === 0) return <Toast state={toast} />;

  return (
    <>
      <ol className="m-0 grid list-none gap-4 p-0">
        {messages.map((m) => {
          const isBusy = busy === m.id;
          const details: [string, string | null][] = [
            ["Organisation", m.organization],
            ["Email", m.email],
            ["Type de projet", m.project_type],
            ["Date souhaitée", m.desired_date],
          ];
          return (
            <li key={m.id}>
              <article
                aria-labelledby={`message-${m.id}`}
                className={`border bg-bg-2 p-[clamp(18px,3vw,28px)] ${m.handled ? "border-line" : "border-teal/60"}`}
              >
                <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                  <h2 id={`message-${m.id}`} className="text-lg tracking-[-0.01em] break-words">
                    {m.name}
                  </h2>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs leading-none font-semibold ${
                      m.handled ? "border-line text-muted" : "border-teal text-teal"
                    }`}
                  >
                    {m.handled ? "Traité" : "À traiter"}
                  </span>
                  <p className="w-full text-sm text-muted">
                    Reçu le <time dateTime={m.created_at}>{formatMessageDate(m.created_at)}</time>
                  </p>
                </header>
                <dl className="mb-4 grid grid-cols-1 gap-x-6 gap-y-2 text-[15px] min-[700px]:grid-cols-2">
                  {details.map(([label, value]) =>
                    value?.trim() ? (
                      <div key={label} className="min-w-0">
                        <dt className="text-sm text-muted">{label}</dt>
                        <dd className="m-0 break-words">{value}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
                <p className="mb-5 border-t border-line pt-4 text-[15px] whitespace-pre-wrap break-words">{m.message}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(REPLY_SUBJECT)}`}
                    className={`${btnLine} ${btnSmall}`}
                  >
                    <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
                    Répondre<span className="sr-only"> à {m.name}</span>
                  </a>
                  <button
                    type="button"
                    disabled={isBusy}
                    className={`${btnLine} ${btnSmall}`}
                    onClick={() => run(m.id, () => setMessageHandled(m.id, !m.handled))}
                  >
                    {m.handled ? (
                      <RotateCcw size={16} strokeWidth={1.8} aria-hidden="true" />
                    ) : (
                      <Check size={16} strokeWidth={1.8} aria-hidden="true" />
                    )}
                    {m.handled ? "Remettre à traiter" : "Marquer comme traité"}
                    <span className="sr-only"> : message de {m.name}</span>
                  </button>
                  <ConfirmButton
                    question={`Supprimer définitivement le message de ${m.name} ?`}
                    confirmLabel="Supprimer le message"
                    pending={isBusy}
                    triggerClassName={`${btnDanger} ${btnSmall}`}
                    triggerLabel={`Supprimer le message de ${m.name}`}
                    trigger={
                      <>
                        <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                        Supprimer
                      </>
                    }
                    onConfirm={() => run(m.id, () => deleteMessage(m.id))}
                  />
                </div>
              </article>
            </li>
          );
        })}
      </ol>
      <Toast state={toast} />
    </>
  );
}
