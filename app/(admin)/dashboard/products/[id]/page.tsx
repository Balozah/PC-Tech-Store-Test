import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";
import { getCategories, getProductById } from "@/lib/data";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">تعديل منتج</h1>
        <DeleteProductButton id={product.id} />
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
