import { Archivo, Alexandria } from "next/font/google";

// Two variable families (see DESIGN.md). Each direction gets its own stack
// (globals.css): Arabic pages use Alexandria for both scripts, English pages
// use Archivo, whose `wdth` axis gives the wide display cut. They are never
// chained in one stack — each family's generated metric fallback (local
// Arial, no unicode-range) would swallow the other script's glyphs.
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-alexandria",
});

export const fontVariables = `${archivo.variable} ${alexandria.variable}`;
