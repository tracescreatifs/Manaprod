import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

// Bouton-lien de la charte (cahier 4.4, prototype .lnk) : cadre fin et carré
// clair contenant une flèche, qui passe au turquoise au survol et au focus.
export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-[52px] items-center gap-[22px] border border-line pl-[22px] text-base font-semibold no-underline transition-colors duration-[250ms] hover:border-teal focus-visible:border-teal"
    >
      {children}
      <span
        aria-hidden="true"
        className="grid size-[52px] shrink-0 place-items-center bg-text text-ink transition-colors duration-[250ms] group-hover:bg-teal group-focus-visible:bg-teal"
      >
        <ArrowRight size={18} strokeWidth={1.8} />
      </span>
    </Link>
  );
}
