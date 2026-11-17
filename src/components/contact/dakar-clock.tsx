"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Dakar",
});

const subscribe = (notify: () => void) => {
  const timer = window.setInterval(notify, 1000);
  return () => window.clearInterval(timer);
};

// Heure de Dakar en direct (maquette .clock), calculée seulement dans le
// navigateur : la page reste statique. L'emplacement est réservé (texte
// masqué tant que l'heure n'est pas connue), sans décalage de mise en page.
export function DakarClock() {
  const time = useSyncExternalStore(
    subscribe,
    () => format.format(new Date()),
    () => null,
  );
  return (
    <span className="contact-clock" data-pending={time ? undefined : ""}>
      <span className="contact-clock__dot" aria-hidden="true" />
      <span>
        Il est <b>{time ?? "00:00"}</b> à Dakar
      </span>
    </span>
  );
}
