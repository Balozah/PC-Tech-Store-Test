import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { CategoryRow } from "@/components/dashboard/category-row";
import { CategoryCreateForm } from "@/components/dashboard/category-create-form";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { isSupabaseConfigured, getCategories, getProducts } from "@/lib/data";

export const metadata = { title: "الأقسام" };

export default async function CategoriesPage() {
  const configured = isSupabaseConfigured();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader title="الأقسام" description="الأقسام يلي بيتصفح فيها الزبون منتجاتك." />
      {!configured && <SupabaseNotice />}

      <CategoryCreateForm />

      {categories.length === 0 ? (
        <EmptyState icon="folder" title="ما في أقسام لسا" description="ضيف أول قسم من فوق، مثلاً: كروت شاشة." />
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
          {categories.map((c, i) => (
            <li key={c.id} className={i > 0 ? "border-t border-[var(--color-border)]" : undefined}>
              <CategoryRow category={c} productCount={counts.get(c.id) ?? 0} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
