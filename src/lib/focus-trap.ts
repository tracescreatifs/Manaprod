// Piégeage du focus dans une fenêtre modale : Tab et Maj+Tab bouclent sur
// les éléments focusables visibles du conteneur, sans passer par le navigateur.
export function trapTab(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const container = event.currentTarget;
  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el.tagName === "IFRAME");
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
