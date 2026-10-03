import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { CategoryRow } from "@/components/dashboard/category-row";
import { createCategory } from "@/app/actions/categories";
import { isSupabaseConfigured, getCategories } from "@/lib/data";

export default async function CategoriesPage() {
  const configured = isSupabaseConfigured();
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">الأقسام</h1>
      {!configured && <SupabaseNotice />}

      <form
        action={async (formData) => {
          "use server";
          await createCategory(formData);
        }}
        className="mb-6 flex flex-wrap items-end gap-2 rounded-xl border border-[var(--color-border)] p-4"
      >
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted-foreground)]">الاسم بالعربي</label>
          <input name="name_ar" required className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted-foreground)]">Name (English)</label>
          <input name="name_en" className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted-foreground)]">slug (اختياري)</label>
          <input name="slug" className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm" />
        </div>
        <button type="submit" className="cursor-pointer rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">
          إضافة قسم
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
