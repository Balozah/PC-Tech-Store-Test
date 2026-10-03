-- Tech RT — Asas package schema
-- Based on the asas skill's reference data model, extended with dual-currency
-- pricing (SYP + USD) and a price-on-request flag per the client brief
-- (brief/brief.md: exchange-rate instability means some products hide price).

create table if not exists admins (
  user_id uuid primary key references auth.users on delete cascade
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  business_name_ar text not null default 'Tech RT',
  business_name_en text default 'Tech RT',
  whatsapp text,                     -- TODO: client has not provided a real number yet
  address_ar text, address_en text,
  maps_url text, maps_embed_url text,
  hours jsonb not null default '[]', -- [{day:'sat', open:'09:00', close:'21:00', closed:false}]
  socials jsonb not null default '{}' -- {instagram:'…', facebook:'…', tiktok:'…'}
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null, name_en text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories on delete set null,
  slug text unique not null,
  name_ar text not null, name_en text,
  description_ar text, description_en text,
  price_usd numeric(12,2),           -- null when price_on_request = true
  price_syp numeric(14,2),           -- null when price_on_request = true
  price_on_request boolean not null default false,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  constraint price_present_unless_on_request
    check (price_on_request or (price_usd is not null and price_syp is not null))
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  path text not null,               -- storage path in bucket 'products'
  sort_order int not null default 0 -- 0 = cover
);

create table if not exists option_groups (           -- e.g. Size, Color, Spec
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  name_ar text not null, name_en text,
  kind text not null default 'text' check (kind in ('text','color')),
  is_required boolean not null default true,
  sort_order int not null default 0
);

create table if not exists option_values (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references option_groups on delete cascade,
  label_ar text not null, label_en text,
  hex text,                          -- for kind = 'color'
  price_override_usd numeric(12,2),  -- null = use product price
  price_override_syp numeric(14,2),
  is_available boolean not null default true,
  sort_order int not null default 0
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 60),
  rating int not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  status text not null default 'pending' check (status in ('pending','approved')),
  created_at timestamptz default now()
);

-- RLS ------------------------------------------------------------------

alter table site_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table option_groups enable row level security;
alter table option_values enable row level security;
alter table admins enable row level security;

create policy "public read" on site_settings for select using (true);
create policy "admin write" on site_settings for all using (is_admin()) with check (is_admin());

create policy "public read" on categories for select using (true);
create policy "admin write" on categories for all using (is_admin()) with check (is_admin());

create policy "public read" on products for select using (true);
create policy "admin write" on products for all using (is_admin()) with check (is_admin());

create policy "public read" on product_images for select using (true);
create policy "admin write" on product_images for all using (is_admin()) with check (is_admin());

create policy "public read" on option_groups for select using (true);
create policy "admin write" on option_groups for all using (is_admin()) with check (is_admin());

create policy "public read" on option_values for select using (true);
create policy "admin write" on option_values for all using (is_admin()) with check (is_admin());

create policy "admin reads admins" on admins for select using (is_admin());

alter table reviews enable row level security;
create policy "read approved" on reviews for select using (status = 'approved' or is_admin());
create policy "anyone submits pending" on reviews for insert with check (status = 'pending');
create policy "admin manages" on reviews for update using (is_admin()) with check (is_admin());
create policy "admin deletes" on reviews for delete using (is_admin());

-- Storage ----------------------------------------------------------------
-- Run in the Supabase dashboard (Storage) or via the API:
--   create bucket 'products', public read.
-- Then add policies on storage.objects:
--   insert/update/delete only when bucket_id = 'products' and is_admin()
