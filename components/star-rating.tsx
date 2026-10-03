export function StarRating({
  value,
  count,
  size = 16,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${value} / 5`}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill={i < Math.round(value) ? "var(--color-accent)" : "none"}
            stroke="var(--color-accent)"
            strokeWidth={1.5}
          >
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.78L10 14.9l-5.21 2.6 1-5.78-4.21-4.1 5.82-.85L10 1.5z" />
          </svg>
        ))}
      </span>
      {typeof count === "number" && (
        <span className="text-sm text-[var(--color-muted-foreground)]">({count})</span>
      )}
    </span>
  );
}
