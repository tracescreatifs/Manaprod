"use client";

import { motion } from "motion/react";

// Texte révélé mot par mot (cahier 4.5) : chaque mot monte derrière un
// masque, avec un décalage de 60 ms par mot. Le texte complet est présent
// dans le HTML pour les lecteurs d'écran (copie masquée visuellement) ;
// les mots animés sont ignorés par les technologies d'assistance.
export function WordReveal({ text, delay = 0.3 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={i}>
            <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
              <motion.span
                data-reveal=""
                className="inline-block"
                initial={{ y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1], delay: delay + i * 0.06 }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>
  );
}
