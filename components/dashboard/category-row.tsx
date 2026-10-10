"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updateCategory, deleteCategory } from "@/app/actions/categories";
import { Icon, Spinner, buttonClass, inputClass, labelClass } from "@/components/dashboard/ui";
import { useConfirm } from "@/components/dashboard/confirm-dialog";
import type { Category } from "@/lib/data";

export function CategoryRow({ category, productCount }: { category: Category; productCount: number }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ask, dialog] = useConfirm();

  if (editing) {
    return (
      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await updateCategory(category.id, formData);
            if (result?.error) setError(result.error);
            else setEditing(false);
          });
        }}
        className="space-y-3 bg-[var(--color-background)] p-4"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>الاسم</label>
            <input name="name_ar" required defaultValue={category.name_ar} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Name (English)</label>
            <input name="name_en" dir="ltr" defaultValue={category.name_en ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>الرابط</label>
            <input name="slug" dir="ltr" required defaultValue={category.slug} className={inputClass} />
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-[var(--color-destructive)]">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={isPending} className={buttonClass.primary}>
            {isPending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
            حفظ
          </button>
          <button type="button" onClick={() => setEditing(false)} className={buttonClass.ghost}>
            إلغاء
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
        <Icon name="folder" />
      </span>
      <Link href={`/dashboard/products?category=${category.slug}`} className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {category.name_ar}
          {category.name_en && <span className="text-[var(--color-muted-foreground)]"> · {category.name_en}</span>}
        </p>
        <p className="text-xs text-[var(--color-muted-foreground)]">{productCount} منتج</p>
      </Link>
      <button type="button" aria-label="تعديل القسم" onClick={() => setEditing(true)} className="grid h-11 w-11 cursor-pointer place-items-center text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        <Icon name="pencil" className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="حذف القسم"
        disabled={isPending}
        onClick={async () => {
          const note = productCount ? `\nالـ ${productCount} منتج يلي فيه بيضلوا بس بدون قسم.` : "";
          if (!(await ask({ message: `حذف قسم "${category.name_ar}"؟${note}`, confirmLabel: "حذف القسم" }))) return;
          startTransition(async () => {
            const result = await deleteCategory(category.id);
            if (result?.error) await ask({ message: result.error, notice: true });
          });
        }}
        className="grid h-11 w-11 cursor-pointer place-items-center text-[var(--color-muted-foreground)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)] disabled:opacity-50"
      >
        {isPending ? <Spinner /> : <Icon name="trash" className="h-4 w-4" />}
      </button>
      {dialog}
    </div>
  );
}
