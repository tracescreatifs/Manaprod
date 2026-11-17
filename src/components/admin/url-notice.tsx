"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/admin/toast";

// Notification transmise par l'adresse (par exemple après le choix d'un
// nouveau mot de passe), retirée de l'adresse pour ne pas réapparaître.
export function UrlNotice({ message }: { message: string }) {
  const [at] = useState(() => Date.now());
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("notification");
    window.history.replaceState(window.history.state, "", url);
  }, []);
  return <Toast state={{ status: "success", message, at }} />;
}
