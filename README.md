# Tech RT

PC parts / laptops / pre-built PCs / accessories storefront. Built on the
Shifra "Asas" package: Next.js + Supabase product catalog with an owner
dashboard, bilingual AR/EN, WhatsApp ordering. See `brief/brief.md` for the
full client brief this site was built from.

## Current status

No Supabase project exists yet. The public site runs on placeholder demo
data (`lib/placeholder-data.ts`) so it's browsable right away with
`npm run dev`. The dashboard requires a real Supabase project to log in —
until then it shows a "Supabase not connected" notice.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 — redirects to `/ar` (default locale).

## Connecting Supabase (required before real use)

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`
   for demo content (optional — replace with real products from the
   dashboard once logged in).
3. Create the storage bucket `products` (public read) and add storage
   policies restricting write access to admins — see the comment at the
   bottom of `supabase/schema.sql`.
4. Auth → disable public sign-ups. Create one user (the store owner) and
   insert their `id` into the `admins` table.
5. Copy `.env.local.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your
   Supabase project settings.
6. (Optional) Regenerate types once the real schema is live:
   ```bash
   supabase gen types typescript --project-id <id> > lib/database.types.ts
   ```
7. Fill in `site_settings` (WhatsApp number, address, hours, socials) from
   the dashboard's "إعدادات الموقع" page.

## TODO before this goes live for real customers

See `brief/brief.md` → "ناقص (TODO)" and "خارج الباقة" for the full list:
real WhatsApp number, owner dashboard email, logo/brand colors, address/
hours/socials, real product photos (current images are generic
placehold.co placeholders, not real product photos), domain name.

## Deploy

Not deployed yet — ask before deploying anywhere. Suggested host: Vercel
(native Next.js support for ISR + Server Actions). Env vars needed:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SITE_URL`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · next-intl (ar/en) ·
Supabase (Postgres + Auth + Storage) · framer-motion
