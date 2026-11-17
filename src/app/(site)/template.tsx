"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";

// Transition douce entre pages (cahier 4.5) : opacité et déplacement de 14 px.
// Le template est remonté à chaque navigation. Au premier chargement, la page
// s'affiche sans transition, pour ne pas retarder le premier affichage (LCP).
let hasMounted = false;

export default function Template({ children }: { children: ReactNode }) {
  const [animate] = useState(() => hasMounted);

  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    // Cible du lien d'évitement « Aller au contenu » (layout).
    <motion.div
      id="contenu"
      tabIndex={-1}
      className="outline-none"
      data-reveal=""
      initial={animate ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
