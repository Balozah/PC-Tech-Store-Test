import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";
import { Icon, PageHeader, buttonClass } from "@/components/dashboard/ui";
import { getCategories, getProductById } from "@/lib/data";

export const metadata = { title: "تعديل منتج" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();

  return (
    <div>
      <PageHeader
        title={product.name_ar}
        backHref="/dashboard/products"
        backLabel="المنتجات"
        actions={
          <>
            <a
              href={`/ar/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass.secondary}
            >
              <Icon name="eye" className="h-4 w-4" />
              عرض بالموقع
            </a>
            <DeleteProductButton id={product.id} />
          </>
        }
      />
      <ProductForm product={product} categories={categories} justCreated={created === "1"} />
    </div>
  );
}
