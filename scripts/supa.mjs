// Supabase setup helper (runs locally; reads SUPABASE_ACCESS_TOKEN from .env.local and never prints secrets).
//   node scripts/supa.mjs check              → confirm the token reaches this project (name, region, status)
//   node scripts/supa.mjs sql <file.sql>...  → run SQL files in order on this project
//   node scripts/supa.mjs keys               → write SUPABASE_SERVICE_ROLE_KEY into .env.local (server-only, value not printed)
import { readFileSync, writeFileSync } from "node:fs";

const envPath = new URL("../.env.local", import.meta.url);
const readEnv = () =>
  Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
  );
const env = readEnv();
const token = env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error("SUPABASE_ACCESS_TOKEN missing in .env.local");
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];

async function api(path, init = {}) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

function setEnv(key, value) {
  let src = readFileSync(envPath, "utf8");
  const line = `${key}=${value}`;
  src = new RegExp(`^${key}=.*$`, "m").test(src) ? src.replace(new RegExp(`^${key}=.*$`, "m"), line) : `${src.trimEnd()}\n${line}\n`;
  writeFileSync(envPath, src);
}

const [cmd, ...files] = process.argv.slice(2);
if (cmd === "check") {
  const p = await api(`/projects/${ref}`);
  console.log([p.name, p.id, p.region, p.status].join(" | "));
} else if (cmd === "sql") {
  for (const f of files) {
    await api(`/projects/${ref}/database/query`, { method: "POST", body: JSON.stringify({ query: readFileSync(f, "utf8") }) });
    console.log(`✓ ${f}`);
  }
} else if (cmd === "keys") {
  const keys = await api(`/projects/${ref}/api-keys?reveal=true`);
  const service = keys.find((k) => k.name === "service_role")?.api_key;
  if (!service) throw new Error(`service_role key not found (got: ${keys.map((k) => k.name).join(", ")})`);
  setEnv("SUPABASE_SERVICE_ROLE_KEY", service);
  console.log("✓ wrote SUPABASE_SERVICE_ROLE_KEY to .env.local");
} else {
  console.log("usage: check | sql <files...> | keys");
}
