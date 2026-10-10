// Lists (or deletes with --apply) files in the "products" bucket that no
// product_images row points to — left behind by deletes before the
// 20261010_storage_admin_select migration. Needs SUPABASE_SERVICE_ROLE_KEY.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const apply = process.argv.includes("--apply");

const { data: rows, error } = await db.from("product_images").select("path");
if (error) throw error;
const used = new Set(rows.map((r) => r.path));

const { data: folders, error: listError } = await db.storage.from("products").list("", { limit: 1000 });
if (listError) throw listError;
const orphans = [];
let bytes = 0;
for (const f of folders) {
  const { data: files } = await db.storage.from("products").list(f.name, { limit: 1000 });
  for (const file of files ?? []) {
    const path = `${f.name}/${file.name}`;
    if (!used.has(path)) { orphans.push(path); bytes += file.metadata?.size ?? 0; }
  }
}
console.log(`${orphans.length} orphan files, ${(bytes / 1024) | 0} KB${apply ? "" : " (dry run)"}`);
for (const o of orphans) console.log("  " + o);
if (apply && orphans.length) {
  const { error: rmError } = await db.storage.from("products").remove(orphans);
  console.log(rmError ? `✗ ${rmError.message}` : `✓ removed ${orphans.length}`);
}
