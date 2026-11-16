import type { CSSProperties } from "react";

export const LOGO_TITLE = "MANA PROD";

// Le logo reçoit soit une largeur, soit une hauteur, jamais les deux :
// l'autre dimension suit le ratio du viewBox, le logo n'est jamais déformé.
export type LogoSize =
  | { width: number | string; height?: never }
  | { height: number | string; width?: never };

export function logoSizeStyle(size: LogoSize): CSSProperties {
  return "width" in size && size.width !== undefined
    ? { display: "block", width: size.width, height: "auto" }
    : { display: "block", height: size.height, width: "auto" };
}
