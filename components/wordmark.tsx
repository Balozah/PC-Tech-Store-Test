export function Wordmark({ name, className }: { name: string; className?: string }) {
  // Text wordmark until the client's logo arrives (brief todo). The first word
  // sits in an ink block, echoing the reference's inverted logotype.
  const [first, ...rest] = name.split(" ");
  return (
    <span dir="ltr" className={`font-wordmark inline-flex items-center gap-1.5 text-lg leading-none ${className ?? ""}`}>
      <span className="bg-[var(--color-foreground)] px-1.5 py-1 text-[var(--color-background)]">{first}</span>
      {rest.length > 0 && <span>{rest.join(" ")}</span>}
    </span>
  );
}
