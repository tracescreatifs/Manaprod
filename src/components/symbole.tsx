import { logoSizeStyle, type LogoSize } from "@/components/logo-size";

// Symbole Éclipse seul, version blanche (disque transparent).
// Tracé repris à l'identique de docs/reference/logo/svg/symbole/mana-prod-symbole-blanc.svg.
// Usage : filigrane du hero de repli (opacité 6 %, décision D14), décoratif.
// Taille : une seule dimension (largeur ou hauteur), l'autre suit le ratio.
export function Symbole({ className, ...size }: LogoSize & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0.00 0.00 100.00 100.00"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={logoSizeStyle(size)}
    >
      <path
        fillRule="evenodd"
        fill="#FFFFFF"
        d="M4.000,50.000A46.000,46.000 0 1 0 96.000,50.000A46.000,46.000 0 1 0 4.000,50.000ZM16.190,52.898A38.640,38.640 0 1 0 93.470,52.898A38.640,38.640 0 1 0 16.190,52.898ZM10.669,29.676A5.457,5.457 0 1 0 21.583,29.676A5.457,5.457 0 1 0 10.669,29.676Z"
      />
    </svg>
  );
}
