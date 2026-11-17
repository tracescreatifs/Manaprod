// Classes des boutons du dashboard : règle d'identité « rond pour ce qu'on
// touche » (D101), pilules pour les boutons, cercles pour les boutons
// d'icône. Champs, listes et panneaux restent à angles droits. Cibles
// tactiles de 44 px minimum.
const base =
  "inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full border px-6 py-[13px] text-[15px] leading-none font-semibold no-underline transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSolid = `${base} border-transparent bg-teal text-ink hover:bg-teal-hi`;
export const btnLine = `${base} border-line bg-transparent text-text hover:border-teal hover:text-teal`;
export const btnDanger = `${base} border-danger bg-transparent text-danger hover:bg-danger hover:text-ink`;
export const btnSmall = "px-4 text-sm";

/** Bouton d'icône rond d'action dans une ligne (prototype .ib), 44 px. */
export const iconBtn =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-text transition-colors hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-text";
export const iconBtnDanger = `${iconBtn} hover:!border-danger hover:!text-danger`;
