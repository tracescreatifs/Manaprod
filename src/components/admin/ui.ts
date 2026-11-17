// Classes des boutons du dashboard (prototype .btn) : angles droits,
// cibles tactiles de 44 px minimum.
const base =
  "inline-flex min-h-11 items-center justify-center gap-2.5 border px-6 py-[13px] text-[15px] leading-none font-semibold no-underline transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSolid = `${base} border-transparent bg-teal text-ink hover:bg-teal-hi`;
export const btnLine = `${base} border-line bg-transparent text-text hover:border-teal hover:text-teal`;
export const btnDanger = `${base} border-danger bg-transparent text-danger hover:bg-danger hover:text-ink`;
export const btnSmall = "px-4 text-sm";
