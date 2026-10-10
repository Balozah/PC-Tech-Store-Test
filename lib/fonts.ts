import { Archivo, Alexandria } from "next/font/google";

// Two variable families (see DESIGN.md): Archivo carries Latin runs and its
// `wdth` axis gives the wide display cut; Alexandria only ships the Arabic
// subset, so Latin glyphs inside Arabic text still render in Archivo.
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const alexandria = Alexandria({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-alexandria",
});

export const fontVariables = `${archivo.variable} ${alexandria.variable}`;
