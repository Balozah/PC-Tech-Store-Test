"use client";

import { createClient } from "@/lib/supabase/client";

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("compression failed"))), type, quality);
  });
}

// Safari can't encode WebP and silently returns a full-size PNG instead, so
// fall back to JPEG there. JPEG has no alpha: paint white (the product-card
// background) under the image first.
async function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<{ blob: Blob; ext: "webp" | "jpg" }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const webp = await toBlob(canvas, "image/webp", quality);
  if (webp.type === "image/webp") return { blob: webp, ext: "webp" };

  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return { blob: await toBlob(canvas, "image/jpeg", quality), ext: "jpg" };
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const { blob, ext } = await compressImage(file);
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from("products").upload(path, blob, {
    contentType: blob.type,
    upsert: false,
  });

  if (error) throw error;
  return path;
}
