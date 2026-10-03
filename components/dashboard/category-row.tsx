"use client";

import { useState, useTransition } from "react";
import { updateCategory, deleteCategory } from "@/app/actions/categories";
import type { Category } from "@/lib/data";

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <form
        action={(formData) => {
          startTransition(async () => {
            const result = await updateCategory(category.id, formData);
            if (result?.error) setError(result.error);
            else setEditing(false);
          });
        }}
        className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-primary)] p-3"
      >
        <input
          name="name_ar"
          defaultValue={category.name_ar}
          placeholder="الاسم بالعربي"
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
        />
        <input
          name="name_en"
          defaultValue={category.name_en ?? ""}
          placeholder="Name (English)"
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
        />
        <input
          name="slug"
          defaultValue={category.slug}
          placeholder="slug"
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
        />
        <button type="submit" disabled={isPending} className="cursor-pointer rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
          حفظ
        </button>
        <button type="button" onClick={() => setEditing(false)} className="cursor-pointer text-xs text-[var(--color-muted-foreground)]">
          إلغاء
        </button>
        {error && <p className="w-full text-xs text-[var(--color-destructive)]">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-3">
      <div>
        <p className="font-medium">{category.name_ar} {category.name_en && `/ ${category.name_en}`}</p>
        <p className="text-xs text-[var(--color-muted-foreground)]">/{category.slug}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="cursor-pointer text-sm text-[var(--color-primary)]">
          تعديل
        </button>
        <button
          onClick={() => {
            if (confirm("حذف هذا القسم؟")) startTransition(async () => { await deleteCategory(category.id); });
          }}
          className="cursor-pointer text-sm text-[var(--color-destructive)]"
        >
          حذف
        </button>
      </div>
    </div>
  );
}
