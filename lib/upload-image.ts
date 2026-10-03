"use client";

import { createClient } from "@/lib/supabase/client";

async function compressToWebp(file: File, maxDimension = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("compression failed"))),
      "image/webp",
      quality
    );
  });
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const blob = await compressToWebp(file);
  const path = `${productId}/${crypto.randomUUID()}.webp`;

  const supabase = createClient();
  const { error } = await supabase.storage.from("products").upload(path, blob, {
    contentType: "image/webp",
    upsert: false,
  });

  if (error) throw error;
  return path;
}
