-- Tech RT — Asas package schema
-- Based on the asas skill's reference data model, extended with dual-currency
-- pricing (SYP + USD) and a price-on-request flag per the client brief
-- (brief/brief.md: exchange-rate instability means some products hide price).

create table if not exists admins (
  user_id uuid primary key references auth.users on delete cascade
);

-- Lives in a schema the REST API doesn't expose, so it can't be called as /rpc/is_admin.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
grant execute on function private.is_admin() to anon, authenticated;

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
  specs jsonb not null default '[]'::jsonb,   -- [{label_ar, label_en, value}] (add-on, see migrations/20261010_product_specs.sql)
  created_at timestamptz default now(), updated_at timestamptz default now(),
  constraint specs_is_array check (jsonb_typeof(specs) = 'array'),
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

-- Review spam guard ------------------------------------------------------
-- Anyone can insert reviews through the public API, so throttling has to live here,
-- not in the Next.js server action. Limits are per product so flooding one product
-- can't block reviews on the rest; the global pending cap only bounds table growth.

create index if not exists reviews_product_created_idx on reviews (product_id, created_at);
create index if not exists reviews_pending_idx on reviews (product_id) where status = 'pending';

create or replace function private.guard_review_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if private.is_admin() then
    return new;
  end if;

  new.status := 'pending';
  new.created_at := now();

  if (select count(*) from public.reviews
        where product_id = new.product_id and created_at > now() - interval '10 minutes') >= 3
     or (select count(*) from public.reviews
        where product_id = new.product_id and status = 'pending') >= 20
     or (select count(*) from public.reviews where status = 'pending') >= 1000 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists guard_review_insert on reviews;
create trigger guard_review_insert before insert on reviews
  for each row execute function private.guard_review_insert();

-- RLS ------------------------------------------------------------------
-- Re-runnable: drops every existing policy on these tables, then recreates them.

do $$
declare p record;
begin
  for p in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in
    ('site_settings','categories','products','product_images','option_groups','option_values','admins','reviews')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

alter table site_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table option_groups enable row level security;
alter table option_values enable row level security;
alter table admins enable row level security;
alter table reviews enable row level security;

create policy "public read" on site_settings for select using (true);
create policy "admin write" on site_settings for all using (private.is_admin()) with check (private.is_admin());

create policy "public read" on categories for select using (true);
create policy "admin write" on categories for all using (private.is_admin()) with check (private.is_admin());

create policy "public read" on products for select using (true);
create policy "admin write" on products for all using (private.is_admin()) with check (private.is_admin());

create policy "public read" on product_images for select using (true);
create policy "admin write" on product_images for all using (private.is_admin()) with check (private.is_admin());

create policy "public read" on option_groups for select using (true);
create policy "admin write" on option_groups for all using (private.is_admin()) with check (private.is_admin());

create policy "public read" on option_values for select using (true);
create policy "admin write" on option_values for all using (private.is_admin()) with check (private.is_admin());

create policy "admin reads admins" on admins for select using (private.is_admin());

create policy "read approved" on reviews for select using (status = 'approved' or private.is_admin());
create policy "anyone submits pending" on reviews for insert with check (status = 'pending');
create policy "admin manages" on reviews for update using (private.is_admin()) with check (private.is_admin());
create policy "admin deletes" on reviews for delete using (private.is_admin());

-- Storage ----------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "products admin insert" on storage.objects;
drop policy if exists "products admin update" on storage.objects;
drop policy if exists "products admin delete" on storage.objects;

create policy "products admin insert" on storage.objects for insert
  with check (bucket_id = 'products' and private.is_admin());
create policy "products admin update" on storage.objects for update
  using (bucket_id = 'products' and private.is_admin())
  with check (bucket_id = 'products' and private.is_admin());
create policy "products admin delete" on storage.objects for delete
  using (bucket_id = 'products' and private.is_admin());

drop function if exists public.is_admin();
