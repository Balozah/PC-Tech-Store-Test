import Link from "next/link";
import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { isSupabaseConfigured, getCategories, getProducts } from "@/lib/data";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const configured = isSupabaseConfigured();
  const [categories, allProducts] = await Promise.all([getCategories(), getProducts(category)]);

  const products = q
    ? allProducts.filter((p) => p.name_ar.includes(q) || p.name_en?.toLowerCase().includes(q.toLowerCase()))
    : allProducts;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">المنتجات</h1>
        <Link href="/dashboard/products/new" className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">
          + منتج جديد
        </Link>
      </div>
      {!configured && <SupabaseNotice />}

      <form className="mb-4 flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="بحث بالاسم" className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm" />
        <select name="category" defaultValue={category ?? ""} className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm">
          <option value="">كل الأقسام</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name_ar}</option>
          ))}
        </select>
        <button type="submit" className="cursor-pointer rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm">
          تصفية
        </button>
      </form>

      <div className="space-y-2">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/products/${p.id}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-3 hover:border-[var(--color-primary)]"
          >
            <span>{p.name_ar} {p.name_en && `/ ${p.name_en}`}</span>
            {!p.is_available && <span className="text-xs text-[var(--color-destructive)]">غير متوفر</span>}
          </Link>
        ))}
        {products.length === 0 && <p className="text-sm text-[var(--color-muted-foreground)]">لا توجد منتجات مطابقة.</p>}
      </div>
    </div>
  );
}
