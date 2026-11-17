import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { PageHead, PanelLoading } from "@/components/admin/page-head";
import { btnLine, btnSmall } from "@/components/admin/ui";
import { getMessages, MESSAGES_PER_PAGE, parseFilter, parsePage, type MessageFilter } from "@/lib/admin/messages";
import { MessagesList } from "./messages-list";

export const metadata: Metadata = { title: "Messages | Dashboard MANA PROD" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTERS: { value: MessageFilter; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "a-traiter", label: "À traiter" },
  { value: "traites", label: "Traités" },
];

const href = (filter: MessageFilter, page = 1) => {
  const params = new URLSearchParams();
  if (filter !== "tous") params.set("filtre", filter);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/admin/messages${query ? `?${query}` : ""}`;
};

async function MessagesContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filter = parseFilter(params.filtre);
  const page = parsePage(params.page);
  const { messages, total } = await getMessages(filter, page);
  const pages = Math.max(1, Math.ceil(total / MESSAGES_PER_PAGE));

  return (
    <>
      <nav aria-label="Filtrer les messages" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={href(f.value)}
            aria-current={f.value === filter ? "page" : undefined}
            className={`inline-flex min-h-11 items-center border px-4 text-sm font-semibold no-underline transition-colors ${
              f.value === filter ? "border-teal bg-bg-3 text-teal" : "border-line text-muted hover:border-teal hover:text-text"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <p className="mb-4 text-sm text-muted" role="status">
        {total === 0
          ? filter === "a-traiter"
            ? "Aucun message à traiter."
            : filter === "traites"
              ? "Aucun message traité."
              : "Aucun message pour l’instant."
          : `${total} message${total > 1 ? "s" : ""}${pages > 1 ? `, page ${Math.min(page, pages)} sur ${pages}` : ""}.`}
      </p>

      <MessagesList key={`${filter}-${page}`} messages={messages} />

      {pages > 1 ? (
        <nav aria-label="Pages de messages" className="mt-6 flex flex-wrap items-center gap-2.5">
          {page > 1 ? (
            <Link href={href(filter, page - 1)} className={`${btnLine} ${btnSmall}`}>
              Page précédente
            </Link>
          ) : null}
          <span className="text-sm text-muted">
            Page {Math.min(page, pages)} sur {pages}
          </span>
          {page < pages ? (
            <Link href={href(filter, page + 1)} className={`${btnLine} ${btnSmall}`}>
              Page suivante
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}

export default function MessagesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHead
        title="Messages"
        lead="Les demandes reçues par le formulaire de contact, les plus récentes en premier."
      />
      <div className="mb-6 flex gap-3 border border-line bg-bg px-[18px] py-4 text-[15px] text-muted">
        <Info size={20} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0 text-teal" />
        <p>Les messages sont effacés automatiquement après 24 mois.</p>
      </div>
      <Suspense fallback={<PanelLoading />}>
        <MessagesContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
