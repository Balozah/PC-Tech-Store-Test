// Pure helper with no server-only dependencies, so client components can
// import it without pulling lib/data.ts (and next/headers) into the bundle.
export function productImageUrl(path: string) {
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/products/${path}`;
}
