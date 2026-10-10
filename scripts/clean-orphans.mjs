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

// PostgREST caps a response at 1000 rows, so page through every image row:
// a partial "used" set would mark live images as orphans.
const PAGE = 1000;
const used = new Set();
for (let from = 0; ; from += PAGE) {
  const { data: rows, error } = await db.from("product_images").select("path").order("id").range(from, from + PAGE - 1);
  if (error) throw error;
  rows.forEach((r) => used.add(r.path));
  if (rows.length < PAGE) break;
}

async function listAll(prefix) {
  const all = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await db.storage.from("products").list(prefix, { limit: PAGE, offset });
    if (error) throw error;
    all.push(...data);
    if (data.length < PAGE) return all;
  }
}

// Files younger than an hour may be uploads whose row isn't inserted yet.
const cutoff = Date.now() - 60 * 60 * 1000;
const orphans = [];
let bytes = 0;
for (const f of await listAll("")) {
  for (const file of await listAll(f.name)) {
    const path = `${f.name}/${file.name}`;
    const created = Date.parse(file.created_at ?? "") || 0;
    if (!used.has(path) && created < cutoff) { orphans.push(path); bytes += file.metadata?.size ?? 0; }
  }
}
console.log(`${orphans.length} orphan files, ${(bytes / 1024) | 0} KB${apply ? "" : " (dry run)"}`);
for (const o of orphans) console.log("  " + o);
if (apply && orphans.length) {
  const { error: rmError } = await db.storage.from("products").remove(orphans);
  console.log(rmError ? `✗ ${rmError.message}` : `✓ removed ${orphans.length}`);
}
