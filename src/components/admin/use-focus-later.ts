"use client";

import { useEffect, useRef } from "react";

// Focus posé après le prochain rendu (ligne ajoutée, déplacée ou retirée) :
// le clavier reste à l'endroit de l'action (accessibilité AA).
export function useFocusLater() {
  const target = useRef<string | null>(null);
  useEffect(() => {
    if (!target.current) return;
    document.getElementById(target.current)?.focus();
    target.current = null;
  });
  return (id: string) => {
    target.current = id;
  };
}
