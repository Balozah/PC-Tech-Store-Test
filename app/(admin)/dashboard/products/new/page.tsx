import { ProductForm } from "@/components/dashboard/product-form";
import { PageHeader } from "@/components/dashboard/ui";
import { getCategories } from "@/lib/data";

export const metadata = { title: "منتج جديد" };

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <PageHeader
        title="منتج جديد"
        description="عبّي المعلومات واحفظ، وبعدها بتضيف الصور."
        backHref="/dashboard/products"
        backLabel="المنتجات"
      />
      <ProductForm product={null} categories={categories} />
    </div>
  );
}
