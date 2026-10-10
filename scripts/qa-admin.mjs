// Temporary dashboard admin for QA runs. Secrets go to .env.local, never printed.
//   node scripts/qa-admin.mjs create  → create qa-dashboard@techrt.test with a random password + admin row
//   node scripts/qa-admin.mjs delete  → remove that user (admin row cascades) and its .env.local lines
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const envPath = new URL("../.env.local", import.meta.url);
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing (node scripts/supa.mjs keys)");
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const EMAIL = "qa-dashboard@techrt.test";

function setEnv(updates) {
  let src = readFileSync(envPath, "utf8");
  for (const [k, v] of Object.entries(updates)) {
    const re = new RegExp(`^${k}=.*\r?\n?`, "m");
    if (v === null) src = src.replace(re, "");
    else src = re.test(src) ? src.replace(new RegExp(`^${k}=.*$`, "m"), `${k}=${v}`) : `${src.trimEnd()}\n${k}=${v}\n`;
  }
  writeFileSync(envPath, src);
}

const { data: list, error: listErr } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listErr) throw listErr;
const existing = list.users.find((u) => u.email === EMAIL);

const cmd = process.argv[2];
if (cmd === "create") {
  const password = randomBytes(15).toString("base64url");
  let user = existing;
  if (user) {
    const { error } = await db.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    if (error) throw error;
  } else {
    const { data, error } = await db.auth.admin.createUser({ email: EMAIL, password, email_confirm: true });
    if (error) throw error;
    user = data.user;
  }
  const { error } = await db.from("admins").upsert({ user_id: user.id }, { onConflict: "user_id" });
  if (error) throw error;
  setEnv({ QA_EMAIL: EMAIL, QA_PASSWORD: password });
  console.log(`✓ QA admin ready (${EMAIL}); credentials written to .env.local`);
} else if (cmd === "delete") {
  if (existing) {
    await db.from("admins").delete().eq("user_id", existing.id);
    const { error } = await db.auth.admin.deleteUser(existing.id);
    if (error) throw error;
  }
  setEnv({ QA_EMAIL: null, QA_PASSWORD: null });
  console.log(existing ? "✓ QA admin deleted" : "✓ no QA admin to delete");
} else {
  console.log("usage: create | delete");
}
