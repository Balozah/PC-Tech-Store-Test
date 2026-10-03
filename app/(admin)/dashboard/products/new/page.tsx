import { ProductForm } from "@/components/dashboard/product-form";
import { getCategories } from "@/lib/data";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">منتج جديد</h1>
      <ProductForm product={null} categories={categories} />
    </div>
  );
}
