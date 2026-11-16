"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

// Apparition au défilement (cahier 4.5) : opacité et déplacement de 20 px.
// L'attribut data-reveal permet à la feuille de style d'afficher le contenu
// directement sans JavaScript et quand l'utilisateur réduit les animations.
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
