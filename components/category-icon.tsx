const paths: Record<string, string> = {
  processors: "M4 4h16v16H4zM9 9h6v6H9zM2 9h2M2 15h2M20 9h2M20 15h2M9 2v2M15 2v2M9 20v2M15 20v2",
  "graphics-cards": "M3 7h18v10H3zM6 17v2h4v-2M14 17v2h4v-2M7 10h2M11 10h2",
  motherboards: "M3 3h18v18H3zM7 7h4v4H7zM14 7h3M14 11h3M7 14h3M14 14h5v5h-5z",
  ram: "M4 9h16v6H4zM7 9v-2M11 9v-2M15 9v-2M7 15v2M11 15v2M15 15v2",
  storage: "M12 2a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 3",
  "power-supply": "M13 2L4 14h6l-1 8 9-12h-6l1-8z",
  cooling: "M12 2v20M2 12h20M5 5l14 14M19 5L5 19",
  laptops: "M4 5h16v10H4zM2 19h20",
  "pre-built-pcs": "M4 3h16v14H4zM9 21h6M12 17v4",
  accessories: "M7 4h10l2 4v12H5V8z M9 4v4h6V4",
};

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const d = paths[slug] ?? paths.accessories;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
