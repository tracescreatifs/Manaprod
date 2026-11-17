import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

// Bouton-lien de la charte, pilule secondaire (règle « rond pour ce qu'on
// touche », D101, maquette .btn.ghost) : contour fin, flèche dans un cercle
// clair, qui passe au turquoise au survol et au focus.
export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-14 items-center gap-3.5 rounded-full border border-line py-2 pr-2 pl-6 text-base font-semibold no-underline transition-colors duration-[250ms] hover:border-teal hover:text-teal focus-visible:border-teal"
    >
      {children}
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-text text-ink transition-[background-color,transform] duration-300 group-hover:translate-x-1 group-hover:bg-teal group-focus-visible:bg-teal motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      >
        <ArrowRight size={18} strokeWidth={1.8} />
      </span>
    </Link>
  );
}
