// Animates as a single block rather than per-word spans: this heading mixes
// Arabic and a Latin brand name ("...Tech RT"), and splitting mixed-script
// text into separate inline-block spans breaks the bidi algorithm's word
// order (the Latin words render reversed). CSS entrance (.enter) so it plays
// on first paint without waiting for JS on slow connections.
export function HeroTitle({ text, className }: { text: string; className?: string }) {
  return <h1 className={`enter ${className ?? ""}`}>{text}</h1>;
}
