"use client";

import { motion, useReducedMotion } from "framer-motion";

// Animates as a single block rather than per-word spans: this heading mixes
// Arabic and a Latin brand name ("...Tech RT"), and splitting mixed-script
// text into separate inline-block spans breaks the bidi algorithm's word
// order (the Latin words render reversed). Keeping it one text node avoids
// that entirely while still giving a clear reveal-on-load animation.
export function HeroTitle({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {text}
    </motion.h1>
  );
}
