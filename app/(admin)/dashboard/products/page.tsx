import Link from "next/link";
import Image from "next/image";
import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { Badge, EmptyState, Icon, PageHeader, buttonClass, formatAdminPrice, inputClass } from "@/components/dashboard/ui";
import { getCardExtras, getCategories, getProducts, isSupabaseConfigured } from "@/lib/data";
import { productImageUrl } from "@/lib/product-image";
import { cn } from "@/lib/utils";

export const metadata = { title: "المنتجات" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const configured = isSupabaseConfigured();
  const [categories, allProducts] = await Promise.all([getCategories(), getProducts(category)]);

  const query = q?.trim().toLowerCase();
  const products = query
    ? allProducts.filter((p) => p.name_ar.toLowerCase().includes(query) || p.name_en?.toLowerCase().includes(query))
    : allProducts;
  const extras = await getCardExtras(products);
  const categoryName = new Map(categories.map((c) => [c.id, c.name_ar]));

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-10 shrink-0 items-center border px-4 text-sm font-medium transition-colors",
      active
        ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
        : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
    );
  const chipHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (slug) params.set("category", slug);
    const s = params.toString();
    return `/dashboard/products${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        title="المنتجات"
        description={`${allProducts.length} منتج${category ? " بهالقسم" : ""}`}
        actions={
          <Link href="/dashboard/products/new" className={buttonClass.primary}>
            <Icon name="plus" className="h-4 w-4" />
            منتج جديد
          </Link>
        }
      />
      {!configured && <SupabaseNotice />}

      <form method="get" className="relative mb-3" role="search">
        {category && <input type="hidden" name="category" value={category} />}
        <Icon name="search" className="pointer-events-none absolute inset-y-0 start-3.5 my-auto h-4 w-4 text-[var(--color-muted-foreground)]" />
        <input name="q" defaultValue={q} placeholder="ابحث باسم المنتج..." aria-label="بحث" className={cn(inputClass, "ps-10")} />
      </form>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <Link href={chipHref()} className={chip(!category)}>
          الكل
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={chipHref(c.slug)} className={chip(category === c.slug)}>
            {c.name_ar}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={query ? "search" : "box"}
          title={query ? "ما في منتجات بهالاسم" : "ما في منتجات لسا"}
          description={query ? "جرّب كلمة تانية أو شيل فلتر القسم." : "ضيف أول منتج وبيطلع بالموقع فوراً."}
          action={
            !query && (
              <Link href="/dashboard/products/new" className={buttonClass.primary}>
                <Icon name="plus" className="h-4 w-4" />
                منتج جديد
              </Link>
            )
          }
        />
      ) : (
        <ul className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)]">
          {products.map((p, i) => {
            const image = extras[p.slug]?.image;
            return (
              <li key={p.id} className={i > 0 ? "border-t border-[var(--color-border)]" : undefined}>
                <Link href={`/dashboard/products/${p.id}`} className="flex items-center gap-3 p-3 transition-colors hover:bg-[var(--color-muted)] sm:gap-4 sm:p-4">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
                    {image ? (
                      <Image src={productImageUrl(image.path)} alt="" fill sizes="64px" className="object-contain p-1.5" />
                    ) : (
                      <Icon name="image" className="absolute inset-0 m-auto text-[var(--color-muted-foreground)]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.name_ar}</span>
                    <span className="mt-0.5 block truncate text-sm font-semibold tabular-nums text-[var(--color-primary)]">
                      {formatAdminPrice(p.price_usd, p.price_syp, p.price_on_request)}
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.category_id && categoryName.get(p.category_id) && <Badge>{categoryName.get(p.category_id)}</Badge>}
                      {p.is_available ? <Badge tone="success">متوفر</Badge> : <Badge tone="danger">غير متوفر</Badge>}
                      {!image && <Badge tone="warning">بدون صورة</Badge>}
                    </span>
                  </span>
                  <Icon name="chevron" className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
