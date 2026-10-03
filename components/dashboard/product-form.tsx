"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  saveProduct,
  addProductImages,
  deleteProductImage,
  reorderProductImages,
  type ProductFormInput,
} from "@/app/actions/products";
import { uploadProductImage } from "@/lib/upload-image";
import { productImageUrl } from "@/lib/product-image";
import type { Category, ProductImage, ProductWithRelations } from "@/lib/data";
import { Card, Icon, Spinner, Switch, buttonClass, hintClass, inputClass, labelClass } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

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

const emptyValue = (): OptionValueDraft => ({
  label_ar: "",
  label_en: "",
  hex: "#000000",
  price_override_usd: "",
  price_override_syp: "",
  is_available: true,
});

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
      hex: v.hex ?? "#000000",
      price_override_usd: v.price_override_usd?.toString() ?? "",
      price_override_syp: v.price_override_syp?.toString() ?? "",
      is_available: v.is_available,
    })),
  }));
}

const toNumber = (value: string) => (value.trim() ? Number(value) : null);

export function ProductForm({
  product,
  categories,
  justCreated = false,
}: {
  product: ProductWithRelations | null;
  categories: Category[];
  justCreated?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(
    justCreated ? { type: "ok", message: "انحفظ المنتج. هلق ضيف صوره من قسم الصور." } : null
  );

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

  const updateGroup = (gi: number, patch: Partial<OptionGroupDraft>) =>
    setGroups((list) => list.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  const updateValue = (gi: number, vi: number, patch: Partial<OptionValueDraft>) =>
    setGroups((list) =>
      list.map((g, i) => (i === gi ? { ...g, values: g.values.map((v, j) => (j === vi ? { ...v, ...patch } : v)) } : g))
    );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const input: ProductFormInput = {
      category_id: categoryId || null,
      name_ar: nameAr.trim(),
      name_en: nameEn.trim() || null,
      description_ar: descAr.trim() || null,
      description_en: descEn.trim() || null,
      price_usd: priceOnRequest ? null : toNumber(priceUsd),
      price_syp: priceOnRequest ? null : toNumber(priceSyp),
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
          price_override_usd: toNumber(v.price_override_usd),
          price_override_syp: toNumber(v.price_override_syp),
          is_available: v.is_available,
        })),
      })),
    };

    startTransition(async () => {
      const result = await saveProduct(product?.id ?? null, input);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
        return;
      }
      if (!product) {
        router.push(`/dashboard/products/${result.id}?created=1`);
      } else {
        setStatus({ type: "ok", message: "انحفظت التعديلات وطلعت عالموقع." });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24">
      <Card title="المعلومات الأساسية">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name_ar" className={labelClass}>
              اسم المنتج <span className="text-[var(--color-destructive)]">*</span>
            </label>
            <input id="name_ar" required value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثلاً: كرت شاشة RTX 4060" className={inputClass} />
          </div>
          <div>
            <label htmlFor="name_en" className={labelClass}>Name (English)</label>
            <input id="name_en" dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="RTX 4060 Graphics Card" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="category" className={labelClass}>القسم</label>
            <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">بدون قسم</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="desc_ar" className={labelClass}>الوصف</label>
            <textarea id="desc_ar" value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={4} placeholder="المواصفات، الضمان، الحالة..." className={inputClass} />
          </div>
          <div>
            <label htmlFor="desc_en" className={labelClass}>Description (English)</label>
            <textarea id="desc_en" dir="ltr" value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={4} className={inputClass} />
          </div>
        </div>
      </Card>

      <Card title="السعر والتوفر">
        <div className="divide-y divide-[var(--color-border)]">
          <div className="pb-3">
            <Switch
              checked={priceOnRequest}
              onChange={setPriceOnRequest}
              label="السعر عند الطلب"
              description="بيخبّي السعر وبيطلب الزبون السعر عالواتساب (مفيد مع تغيّر الصرف)"
            />
          </div>
          {!priceOnRequest && (
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price_usd" className={labelClass}>السعر بالدولار</label>
                <div className="relative">
                  <input id="price_usd" dir="ltr" inputMode="decimal" type="number" step="0.01" min="0" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} className={cn(inputClass, "pe-9")} />
                  <span className="pointer-events-none absolute inset-y-0 end-3.5 my-auto h-fit text-sm text-[var(--color-muted-foreground)]">$</span>
                </div>
              </div>
              <div>
                <label htmlFor="price_syp" className={labelClass}>السعر بالليرة السورية</label>
                <div className="relative">
                  <input id="price_syp" dir="ltr" inputMode="numeric" type="number" step="1" min="0" value={priceSyp} onChange={(e) => setPriceSyp(e.target.value)} className={cn(inputClass, "pe-12")} />
                  <span className="pointer-events-none absolute inset-y-0 end-3.5 my-auto h-fit text-sm text-[var(--color-muted-foreground)]">ل.س</span>
                </div>
              </div>
            </div>
          )}
          <div className="pt-3">
            <Switch
              checked={isAvailable}
              onChange={setIsAvailable}
              label="متوفر حالياً"
              description={isAvailable ? "الزبون بيقدر يطلبه" : "بيضل ظاهر بالموقع بس زر الطلب مسكّر"}
            />
          </div>
        </div>
      </Card>

      <Card
        title="الخيارات"
        description="مثل السعة أو اللون. كل خيار ممكن يكون إله سعر خاص."
        action={
          <button
            type="button"
            onClick={() =>
              setGroups((g) => [...g, { name_ar: "", name_en: "", kind: "text", is_required: true, values: [emptyValue()] }])
            }
            className={buttonClass.secondary}
          >
            <Icon name="plus" className="h-4 w-4" />
            مجموعة
          </button>
        }
      >
        {groups.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">ما في خيارات. هالمنتج بيتطلب متل ما هو.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group, gi) => (
              <div key={gi} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 sm:p-4">
                <div className="mb-3 flex items-start gap-2">
                  <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      aria-label="اسم المجموعة"
                      value={group.name_ar}
                      onChange={(e) => updateGroup(gi, { name_ar: e.target.value })}
                      placeholder="اسم المجموعة (مثلاً: السعة)"
                      className={inputClass}
                    />
                    <input
                      aria-label="Group name (English)"
                      dir="ltr"
                      value={group.name_en}
                      onChange={(e) => updateGroup(gi, { name_en: e.target.value })}
                      placeholder="Group name"
                      className={inputClass}
                    />
                    <select
                      aria-label="نوع الخيار"
                      value={group.kind}
                      onChange={(e) => updateGroup(gi, { kind: e.target.value as "text" | "color" })}
                      className={inputClass}
                    >
                      <option value="text">نص</option>
                      <option value="color">لون</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    aria-label="حذف المجموعة"
                    onClick={() => setGroups((list) => list.filter((_, i) => i !== gi))}
                    className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-[var(--color-muted-foreground)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)]"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {group.values.map((value, vi) => (
                    <div key={vi} className="rounded-lg border border-[var(--color-border)] p-2.5">
                      <div className="flex items-center gap-2">
                        {group.kind === "color" && (
                          <input
                            type="color"
                            aria-label="اللون"
                            value={value.hex || "#000000"}
                            onChange={(e) => updateValue(gi, vi, { hex: e.target.value })}
                            className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-[var(--color-border)] bg-transparent p-1"
                          />
                        )}
                        <input
                          aria-label="القيمة"
                          value={value.label_ar}
                          onChange={(e) => updateValue(gi, vi, { label_ar: e.target.value })}
                          placeholder={group.kind === "color" ? "أسود" : "1TB"}
                          className={inputClass}
                        />
                        <input
                          aria-label="Value (English)"
                          dir="ltr"
                          value={value.label_en}
                          onChange={(e) => updateValue(gi, vi, { label_en: e.target.value })}
                          placeholder={group.kind === "color" ? "Black" : "1TB"}
                          className={inputClass}
                        />
                        <button
                          type="button"
                          aria-label="حذف القيمة"
                          onClick={() => updateGroup(gi, { values: group.values.filter((_, j) => j !== vi) })}
                          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)]"
                        >
                          <Icon name="x" className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                        <input
                          aria-label="سعر هالخيار بالدولار"
                          dir="ltr"
                          type="number"
                          inputMode="decimal"
                          value={value.price_override_usd}
                          onChange={(e) => updateValue(gi, vi, { price_override_usd: e.target.value })}
                          placeholder="سعره $ (اختياري)"
                          className={inputClass}
                        />
                        <input
                          aria-label="سعر هالخيار بالليرة"
                          dir="ltr"
                          type="number"
                          inputMode="numeric"
                          value={value.price_override_syp}
                          onChange={(e) => updateValue(gi, vi, { price_override_syp: e.target.value })}
                          placeholder="سعره ل.س (اختياري)"
                          className={inputClass}
                        />
                        <label className="col-span-2 flex min-h-11 cursor-pointer items-center gap-2 text-sm sm:col-span-1">
                          <input
                            type="checkbox"
                            checked={value.is_available}
                            onChange={(e) => updateValue(gi, vi, { is_available: e.target.checked })}
                            className="h-4 w-4 accent-[var(--color-primary)]"
                          />
                          متوفر
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => updateGroup(gi, { values: [...group.values, emptyValue()] })}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-medium text-[var(--color-primary)]"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    قيمة جديدة
                  </button>
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                    <input
                      type="checkbox"
                      checked={group.is_required}
                      onChange={(e) => updateGroup(gi, { is_required: e.target.checked })}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    لازم الزبون يختار
                  </label>
                </div>
              </div>
            ))}
            <p className={hintClass}>سعر الخيار بيحل محل سعر المنتج لما الزبون يختاره. اتركه فاضي إذا نفس السعر.</p>
          </div>
        )}
      </Card>

      {product ? (
        <ImagesManager
          key={product.images.map((i) => `${i.id}:${i.sort_order}`).join(",")}
          productId={product.id}
          images={product.images}
          onStatus={setStatus}
        />
      ) : (
        <Card title="الصور">
          <p className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <Icon name="image" className="h-4 w-4" />
            احفظ المنتج أول، وبعدها بتقدر ترفع صوره.
          </p>
        </Card>
      )}

      {/* Sticky save bar: sits above the mobile tab bar, at the bottom on desktop */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-md md:bottom-0 md:start-64">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 md:px-8">
          <p
            role={status?.type === "error" ? "alert" : "status"}
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              status?.type === "error" ? "text-[var(--color-destructive)]" : "text-[var(--color-success)]"
            )}
          >
            {status && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name={status.type === "error" ? "alert" : "check"} className="h-4 w-4" />
                {status.message}
              </span>
            )}
          </p>
          <button type="submit" disabled={isPending} className={cn(buttonClass.primary, "min-w-32")}>
            {isPending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
            {product ? "حفظ التعديلات" : "إنشاء المنتج"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ImagesManager({
  productId,
  images: initialImages,
  onStatus,
}: {
  productId: string;
  images: ProductImage[];
  onStatus: (status: { type: "ok" | "error"; message: string } | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(files.length);
    onStatus(null);
    try {
      const paths = await Promise.all(files.map((file) => uploadProductImage(productId, file)));
      const result = await addProductImages(productId, paths);
      if (result?.error) onStatus({ type: "error", message: result.error });
      else onStatus({ type: "ok", message: files.length > 1 ? `انرفعت ${files.length} صور.` : "انرفعت الصورة." });
    } catch {
      onStatus({ type: "error", message: "فشل رفع الصورة. تأكد من النت وجرّب مرة تانية." });
    } finally {
      setUploading(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
    const result = await reorderProductImages(productId, next.map((i) => i.id));
    if (result?.error) {
      setImages(images);
      onStatus({ type: "error", message: result.error });
    }
  }

  async function remove(image: ProductImage) {
    if (!confirm("حذف هالصورة؟")) return;
    setBusyId(image.id);
    const result = await deleteProductImage(image.id);
    setBusyId(null);
    if (result?.error) onStatus({ type: "error", message: result.error });
    else setImages((list) => list.filter((i) => i.id !== image.id));
  }

  return (
    <Card title="الصور" description="أول صورة هي الغلاف يلي بيبيّن ببطاقة المنتج.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, index) => (
          <div key={img.id} className={cn("overflow-hidden rounded-xl border-2 bg-[var(--color-background)]", index === 0 ? "border-[var(--color-primary)]" : "border-[var(--color-border)]")}>
            <div className="relative aspect-square">
              <Image src={productImageUrl(img.path)} alt="" fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
              {index === 0 && (
                <span className="absolute start-2 top-2 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[11px] font-semibold text-white">الغلاف</span>
              )}
              {busyId === img.id && (
                <span className="absolute inset-0 grid place-items-center bg-black/60">
                  <Spinner className="h-6 w-6 text-white" />
                </span>
              )}
            </div>
            <div className="flex items-center justify-between p-1">
              <button type="button" aria-label="تقديم الصورة" disabled={index === 0} onClick={() => move(index, index - 1)} className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-30">
                <Icon name="back" className="h-4 w-4" />
              </button>
              {index !== 0 ? (
                <button type="button" onClick={() => move(index, 0)} className="min-h-11 cursor-pointer px-1 text-xs font-medium text-[var(--color-primary)]">
                  غلاف
                </button>
              ) : (
                <span />
              )}
              <button type="button" aria-label="حذف الصورة" onClick={() => remove(img)} className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-[var(--color-muted-foreground)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)]">
                <Icon name="trash" className="h-4 w-4" />
              </button>
              <button type="button" aria-label="تأخير الصورة" disabled={index === images.length - 1} onClick={() => move(index, index + 1)} className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-30">
                <Icon name="chevron" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <label
          className={cn(
            "flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-border)] text-center text-sm text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]",
            uploading && "pointer-events-none opacity-70"
          )}
        >
          {uploading ? (
            <>
              <Spinner className="h-6 w-6" />
              جاري رفع {uploading > 1 ? `${uploading} صور` : "الصورة"}...
            </>
          ) : (
            <>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-muted)]">
                <Icon name="plus" />
              </span>
              إضافة صور
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading > 0} className="sr-only" />
        </label>
      </div>
    </Card>
  );
}
