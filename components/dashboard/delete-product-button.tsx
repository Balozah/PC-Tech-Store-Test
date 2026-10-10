"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions/products";
import { Icon, Spinner, buttonClass } from "@/components/dashboard/ui";
import { useConfirm } from "@/components/dashboard/confirm-dialog";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [ask, dialog] = useConfirm();

  return (
    <>
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        if (!(await ask({ message: "حذف هالمنتج مع كل صوره نهائياً؟", confirmLabel: "حذف المنتج" }))) return;
        startTransition(async () => {
          const result = await deleteProduct(id);
          if (result?.error) {
            await ask({ message: result.error, notice: true });
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
    {dialog}
    </>
  );
}
