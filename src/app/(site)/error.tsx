"use client";

import { ErrorContent } from "@/components/pages/error-content";

// Page d'erreur du site public (D68), affichée avec l'en-tête et le pied
// de page du groupe (site).
export default function SiteErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <ErrorContent retry={retry} />;
}
