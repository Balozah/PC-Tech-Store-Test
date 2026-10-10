-- Add-on: specifications table on product pages.
-- Ordered rows of {label_ar, label_en, value}; empty array = no table shown.
-- Safe to run more than once.
alter table products
  add column if not exists specs jsonb not null default '[]'::jsonb;

alter table products
  drop constraint if exists specs_is_array;
alter table products
  add constraint specs_is_array check (jsonb_typeof(specs) = 'array');
