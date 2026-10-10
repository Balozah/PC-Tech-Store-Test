// Re-encodes product images that were stored as full-size PNGs under a .webp
// name (old Safari upload bug) into real WebP at max 1600px, in place.
// --apply needs SUPABASE_SERVICE_ROLE_KEY in .env.local (node scripts/supa.mjs keys).
//   node scripts/fix-images.mjs          → dry run: list affected files
//   node scripts/fix-images.mjs --apply  → re-encode and overwrite them
import { readFileSync } from "node:fs";
import sharp from "sharp";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const base = env.NEXT_PUBLIC_SUPABASE_URL;
const apply = process.argv.includes("--apply");
// Reads are public (anon key); only --apply needs the service role.
const key = apply ? env.SUPABASE_SERVICE_ROLE_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!key) throw new Error(apply ? "SUPABASE_SERVICE_ROLE_KEY missing in .env.local (node scripts/supa.mjs keys)" : "anon key missing");
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const rows = await (await fetch(`${base}/rest/v1/product_images?select=path`, { headers })).json();
for (const { path } of rows) {
  if (path.startsWith("http")) continue;
  const res = await fetch(`${base}/storage/v1/object/public/products/${path}`);
  if (!res.ok) { console.log(`skip ${path} (${res.status})`); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  const declared = path.split(".").pop();
  const bad = (declared === "webp" && meta.format !== "webp") || buf.length > 600_000;
  if (!bad) continue;
  const out = await sharp(buf).resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).webp({ quality: 82 }).toBuffer();
  console.log(`${path}: ${meta.format} ${meta.width}x${meta.height} ${(buf.length / 1024) | 0}KB → webp ${(out.length / 1024) | 0}KB`);
  if (!apply) continue;
  const up = await fetch(`${base}/storage/v1/object/products/${path}`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "image/webp", "x-upsert": "true", "cache-control": "max-age=3600" },
    body: out,
  });
  console.log(up.ok ? "  ✓ replaced" : `  ✗ ${up.status} ${await up.text()}`);
}
