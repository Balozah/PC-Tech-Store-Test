import Link from "next/link";
import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { isSupabaseConfigured, getCategories, getProducts } from "@/lib/data";

export default async function DashboardOverview() {
  const configured = isSupabaseConfigured();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">نظرة عامة</h1>
      {!configured && <SupabaseNotice />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/categories"
          className="rounded-2xl border border-[var(--color-border)] p-6 hover:border-[var(--color-primary)]"
        >
          <p className="text-sm text-[var(--color-muted-foreground)]">الأقسام</p>
          <p className="mt-1 text-3xl font-bold">{categories.length}</p>
        </Link>
        <Link
          href="/dashboard/products"
          className="rounded-2xl border border-[var(--color-border)] p-6 hover:border-[var(--color-primary)]"
        >
          <p className="text-sm text-[var(--color-muted-foreground)]">المنتجات</p>
          <p className="mt-1 text-3xl font-bold">{products.length}</p>
        </Link>
      </div>
    </div>
  );
}
