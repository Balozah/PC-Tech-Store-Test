"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions/products";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm("حذف هذا المنتج نهائياً؟")) return;
        startTransition(async () => {
          const result = await deleteProduct(id);
          if (result?.error) {
            alert(result.error);
            return;
          }
          router.push("/dashboard/products");
        });
      }}
      className="cursor-pointer text-sm text-[var(--color-destructive)] disabled:opacity-50"
    >
      حذف المنتج
    </button>
  );
}
