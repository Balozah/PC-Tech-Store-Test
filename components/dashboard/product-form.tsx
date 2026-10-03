"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveProduct, addProductImage, deleteProductImage, type ProductFormInput } from "@/app/actions/products";
import { uploadProductImage } from "@/lib/upload-image";
import { productImageUrl } from "@/lib/product-image";
import type { Category, ProductWithRelations } from "@/lib/data";

type OptionValueDraft = {
  id?: string;
  label_ar: string;
  label_en: string;
  hex: string;
  price_override_usd: string;
  price_override_syp: string;
  is_available: boolean;
};

type OptionGroupDraft = {
  id?: string;
  name_ar: string;
  name_en: string;
  kind: "text" | "color";
  is_required: boolean;
  values: OptionValueDraft[];
};

function toDraftGroups(product: ProductWithRelations | null): OptionGroupDraft[] {
  if (!product) return [];
  return product.optionGroups.map((g) => ({
    id: g.id,
    name_ar: g.name_ar,
    name_en: g.name_en ?? "",
    kind: g.kind,
    is_required: g.is_required,
    values: g.values.map((v) => ({
      id: v.id,
      label_ar: v.label_ar,
      label_en: v.label_en ?? "",
      hex: v.hex ?? "",
      price_override_usd: v.price_override_usd?.toString() ?? "",
      price_override_syp: v.price_override_syp?.toString() ?? "",
      is_available: v.is_available,
    })),
  }));
}

export function ProductForm({
  product,
  categories,
}: {
  product: ProductWithRelations | null;
  categories: Category[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nameAr, setNameAr] = useState(product?.name_ar ?? "");
  const [nameEn, setNameEn] = useState(product?.name_en ?? "");
  const [descAr, setDescAr] = useState(product?.description_ar ?? "");
  const [descEn, setDescEn] = useState(product?.description_en ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [priceUsd, setPriceUsd] = useState(product?.price_usd?.toString() ?? "");
  const [priceSyp, setPriceSyp] = useState(product?.price_syp?.toString() ?? "");
  const [priceOnRequest, setPriceOnRequest] = useState(product?.price_on_request ?? false);
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [groups, setGroups] = useState<OptionGroupDraft[]>(toDraftGroups(product));

  function addGroup() {
    setGroups((g) => [...g, { name_ar: "", name_en: "", kind: "text", is_required: true, values: [] }]);
  }

  function addValue(gi: number) {
    setGroups((g) =>
      g.map((group, i) =>
        i === gi
          ? {
              ...group,
              values: [
                ...group.values,
                { label_ar: "", label_en: "", hex: "", price_override_usd: "", price_override_syp: "", is_available: true },
              ],
            }
          : group
      )
    );
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setUploading(true);
    setError(null);
    try {
      const path = await uploadProductImage(product.id, file);
      const result = await addProductImage(product.id, path, product.images.length);
      if (result?.error) setError(result.error);
      else router.refresh();
    } catch {
      setError("فشل رفع الصورة");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSubmit() {
    setError(null);
    const input: ProductFormInput = {
      category_id: categoryId || null,
      name_ar: nameAr,
      name_en: nameEn || null,
      description_ar: descAr || null,
      description_en: descEn || null,
      price_usd: priceOnRequest ? null : priceUsd ? Number(priceUsd) : null,
      price_syp: priceOnRequest ? null : priceSyp ? Number(priceSyp) : null,
      price_on_request: priceOnRequest,
      is_available: isAvailable,
      optionGroups: groups.map((g) => ({
        id: g.id,
        name_ar: g.name_ar,
        name_en: g.name_en || null,
        kind: g.kind,
        is_required: g.is_required,
        values: g.values.map((v) => ({
          id: v.id,
          label_ar: v.label_ar,
          label_en: v.label_en || null,
          hex: g.kind === "color" ? v.hex || null : null,
          price_override_usd: v.price_override_usd ? Number(v.price_override_usd) : null,
          price_override_syp: v.price_override_syp ? Number(v.price_override_syp) : null,
          is_available: v.is_available,
        })),
      })),
    };

    startTransition(async () => {
      const result = await saveProduct(product?.id ?? null, input);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!product) {
        router.push(`/dashboard/products/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">الاسم بالعربي</label>
          <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Name (English)</label>
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">الوصف بالعربي</label>
          <textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={3} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description (English)</label>
          <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">القسم</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm">
          <option value="">بدون قسم</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name_ar}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={priceOnRequest} onChange={(e) => setPriceOnRequest(e.target.checked)} />
          السعر عند الطلب (بدل سعر ثابت)
        </label>
        {!priceOnRequest && (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">السعر بالدولار</label>
              <input type="number" step="0.01" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">السعر بالليرة السورية</label>
              <input type="number" step="1" value={priceSyp} onChange={(e) => setPriceSyp(e.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
            </div>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
        متوفر حالياً
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">خيارات المنتج (مثل السعة أو اللون)</h3>
          <button type="button" onClick={addGroup} className="cursor-pointer text-sm text-[var(--color-primary)]">
            + إضافة مجموعة خيارات
          </button>
        </div>
        <div className="space-y-4">
          {groups.map((group, gi) => (
            <div key={gi} className="rounded-xl border border-[var(--color-border)] p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="اسم المجموعة بالعربي (مثلاً: السعة)"
                  value={group.name_ar}
                  onChange={(e) =>
                    setGroups((g) => g.map((x, i) => (i === gi ? { ...x, name_ar: e.target.value } : x)))
                  }
                  className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Group name (English)"
                  value={group.name_en}
                  onChange={(e) =>
                    setGroups((g) => g.map((x, i) => (i === gi ? { ...x, name_en: e.target.value } : x)))
                  }
                  className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div className="mt-2 space-y-2">
                {group.values.map((value, vi) => (
                  <div key={vi} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input
                      placeholder="القيمة بالعربي"
                      value={value.label_ar}
                      onChange={(e) =>
                        setGroups((g) =>
                          g.map((x, i) =>
                            i === gi
                              ? { ...x, values: x.values.map((v, j) => (j === vi ? { ...v, label_ar: e.target.value } : v)) }
                              : x
                          )
                        )
                      }
                      className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                    />
                    <input
                      placeholder="Value (English)"
                      value={value.label_en}
                      onChange={(e) =>
                        setGroups((g) =>
                          g.map((x, i) =>
                            i === gi
                              ? { ...x, values: x.values.map((v, j) => (j === vi ? { ...v, label_en: e.target.value } : v)) }
                              : x
                          )
                        )
                      }
                      className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                    />
                    <input
                      placeholder="سعر إضافي $ (اختياري)"
                      value={value.price_override_usd}
                      onChange={(e) =>
                        setGroups((g) =>
                          g.map((x, i) =>
                            i === gi
                              ? { ...x, values: x.values.map((v, j) => (j === vi ? { ...v, price_override_usd: e.target.value } : v)) }
                              : x
                          )
                        )
                      }
                      className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                    />
                    <input
                      placeholder="سعر إضافي ل.س (اختياري)"
                      value={value.price_override_syp}
                      onChange={(e) =>
                        setGroups((g) =>
                          g.map((x, i) =>
                            i === gi
                              ? { ...x, values: x.values.map((v, j) => (j === vi ? { ...v, price_override_syp: e.target.value } : v)) }
                              : x
                          )
                        )
                      }
                      className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm"
                    />
                  </div>
                ))}
                <button type="button" onClick={() => addValue(gi)} className="cursor-pointer text-xs text-[var(--color-primary)]">
                  + إضافة قيمة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {product ? (
        <div>
          <h3 className="mb-2 font-semibold">الصور</h3>
          <div className="flex flex-wrap gap-3">
            {product.images.map((img) => (
              <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-lg border border-[var(--color-border)]">
                <Image src={productImageUrl(img.path)} alt="" fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => startTransition(async () => {
                    await deleteProductImage(img.id, img.path);
                    router.refresh();
                  })}
                  className="absolute right-1 top-1 cursor-pointer rounded-full bg-black/70 px-1.5 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="mt-3 text-sm" />
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted-foreground)]">احفظ المنتج أولاً لتتمكن من رفع الصور.</p>
      )}

      {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="cursor-pointer rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {product ? "حفظ التعديلات" : "إنشاء المنتج"}
      </button>
    </div>
  );
}
