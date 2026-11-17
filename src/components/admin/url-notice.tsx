"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/admin/toast";

// Notification transmise par l'adresse (par exemple après le choix d'un
// nouveau mot de passe), retirée de l'adresse pour ne pas réapparaître.
export function UrlNotice({ message }: { message: string }) {
  const [at] = useState(() => Date.now());
  useEffect(() => {
    // Après la fin de la navigation en cours (sinon le routeur remet l'adresse).
    const id = window.setTimeout(() => {
      const url = new URL(window.location.href);
      if (!url.searchParams.has("notification")) return;
      url.searchParams.delete("notification");
      // État null : le routeur de Next.js se synchronise sur la nouvelle adresse.
      window.history.replaceState(null, "", url);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  return <Toast state={{ status: "success", message, at }} />;
}
