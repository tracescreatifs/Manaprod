"use client";

import { ErrorContent } from "@/components/pages/error-content";

// Page d'erreur hors du site public (dashboard notamment), D68.
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div id="contenu" tabIndex={-1} className="outline-none">
      <ErrorContent retry={retry} />
    </div>
  );
}
