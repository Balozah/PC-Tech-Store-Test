import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { CategoryRow } from "@/components/dashboard/category-row";
import { CategoryCreateForm } from "@/components/dashboard/category-create-form";
import { isSupabaseConfigured, getCategories } from "@/lib/data";

export default async function CategoriesPage() {
  const configured = isSupabaseConfigured();
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">الأقسام</h1>
      {!configured && <SupabaseNotice />}

      <CategoryCreateForm />

      <div className="space-y-2">
        {categories.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
