"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions/products";
import { Icon, Spinner, buttonClass } from "@/components/dashboard/ui";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("حذف هالمنتج مع كل صوره نهائياً؟")) return;
        startTransition(async () => {
          const result = await deleteProduct(id);
          if (result?.error) {
            alert(result.error);
            return;
          }
          router.push("/dashboard/products");
        });
      }}
      className={buttonClass.danger}
    >
      {isPending ? <Spinner /> : <Icon name="trash" className="h-4 w-4" />}
      حذف
    </button>
  );
}
