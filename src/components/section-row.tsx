import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

// Rangée éditoriale du prototype (.row2) : titre de section à gauche (4/12),
// contenu à droite (8/12), filet au-dessus sauf pour la première rangée.
// Une colonne sous 820 px. Apparition au défilement, sauf pour la première
// rangée, visible dès l'ouverture : elle s'affiche sans attendre JavaScript
// pour ne pas retarder le LCP (décision D59).
export function SectionRow({
  title,
  first = false,
  className = "",
  children,
}: {
  title: string;
  first?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const classes = `grid gap-x-[clamp(32px,6vw,120px)] gap-y-6 py-[clamp(40px,5vw,76px)] min-[821px]:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] ${
    first ? "" : "border-t border-line"
  } ${className}`;
  const content = (
    <>
      <h2 className="text-[clamp(20px,1.8vw,26px)] leading-[1.05] font-bold tracking-[-0.01em]">
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </>
  );

  return first ? <div className={classes}>{content}</div> : <Reveal className={classes}>{content}</Reveal>;
}
