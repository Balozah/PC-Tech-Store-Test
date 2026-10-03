"use client";

import { useRef, useState, useTransition } from "react";
import { createCategory } from "@/app/actions/categories";

const inputClass = "w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2.5 text-base sm:text-sm";

export function CategoryCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "idle" | "ok" | "error"; message?: string }>({ type: "idle" });

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          const result = await createCategory(formData);
          if (result?.error) {
            setStatus({ type: "error", message: result.error });
          } else {
            setStatus({ type: "ok" });
            formRef.current?.reset();
          }
        });
      }}
      className="mb-6 grid gap-3 rounded-xl border border-[var(--color-border)] p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
    >
      <div>
        <label className="mb-1 block text-xs text-[var(--color-muted-foreground)]">الاسم بالعربي</label>
        <input name="name_ar" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--color-muted-foreground)]">Name (English)</label>
        <input name="name_en" dir="ltr" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--color-muted-foreground)]">رابط القسم (اختياري)</label>
        <input name="slug" dir="ltr" placeholder="graphics-cards" className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 cursor-pointer rounded-full bg-[var(--color-primary)] px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "جاري الإضافة..." : "إضافة قسم"}
      </button>
      {status.type === "ok" && <p className="text-sm text-[var(--color-success)] sm:col-span-4">✓ انضاف القسم</p>}
      {status.type === "error" && <p className="text-sm text-[var(--color-destructive)] sm:col-span-4">{status.message}</p>}
    </form>
  );
}
