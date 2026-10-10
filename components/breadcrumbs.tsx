import { Link } from "@/i18n/navigation";
import { ChevronIcon } from "@/components/icons";

export type Crumb = { label: string; href?: string };

// Visible trail plus BreadcrumbList structured data. `siteUrl` + `locale`
// build the absolute URLs search engines expect.
export function Breadcrumbs({ items, siteUrl, locale }: { items: Crumb[]; siteUrl: string; locale: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${siteUrl}/${locale}${c.href === "/" ? "" : c.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-ink-soft)]">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronIcon className="size-3.5 rtl:-scale-x-100" />}
            {c.href ? (
              <Link href={c.href} className="py-1 transition-colors hover:text-[var(--color-ink)]">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 py-1 text-[var(--color-ink)]">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </nav>
  );
}
