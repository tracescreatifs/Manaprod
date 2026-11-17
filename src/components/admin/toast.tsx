"use client";

import { useEffect, useState } from "react";
import type { ActionState } from "@/lib/admin/action-state";

const DURATION = 4500;

// Notification de succès ou d'erreur après une action (cahier 7.7,
// prototype .toast), annoncée aux lecteurs d'écran. Chaque nouveau
// résultat (horodatage « at ») affiche une nouvelle notification.
export function Toast({ state }: { state: Pick<ActionState, "status" | "message" | "at"> }) {
  const [shownAt, setShownAt] = useState<number | undefined>(undefined);
  const [hiddenAt, setHiddenAt] = useState<number | undefined>(undefined);

  if (state.at !== shownAt) {
    setShownAt(state.at);
  }

  useEffect(() => {
    if (!state.at) return;
    const id = window.setTimeout(() => setHiddenAt(state.at), DURATION);
    return () => window.clearTimeout(id);
  }, [state.at]);

  const visible = Boolean(state.message && state.at && hiddenAt !== state.at);
  const isError = state.status === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className="pointer-events-none fixed right-5 bottom-5 left-5 z-[200] flex justify-end"
    >
      {visible ? (
        <p
          className={`pointer-events-auto max-w-md px-5 py-3.5 font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${
            isError ? "bg-danger text-ink" : "bg-teal text-ink"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
