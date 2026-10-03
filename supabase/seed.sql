-- Placeholder demo content for Tech RT.
-- Images use placehold.co generated placeholders (not scraped/copyrighted
-- product photos) — per brief/brief.md TODO, replace with real product
-- photos before the site goes live for real customers.

insert into site_settings (id, business_name_ar, business_name_en, whatsapp)
values (1, 'Tech RT', 'Tech RT', null)
on conflict (id) do nothing;

insert into categories (slug, name_ar, name_en, sort_order) values
  ('processors',   'معالجات',        'Processors',    1),
  ('graphics-cards','كروت شاشة',     'Graphics Cards',2),
  ('motherboards', 'لوحات أم',       'Motherboards',  3),
  ('ram',          'ذاكرة RAM',      'RAM',           4),
  ('storage',      'وحدات تخزين',    'Storage',       5),
  ('power-supply', 'مزودات طاقة',    'Power Supply',  6),
  ('cooling',      'تبريد',          'Cooling',       7),
  ('laptops',      'لابتوبات',       'Laptops',       8),
  ('pre-built-pcs','تجميعات جاهزة',  'Pre-Built PCs', 9),
  ('accessories',  'إكسسوارات',      'Accessories',   10)
on conflict (slug) do nothing;

-- Processors
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'intel-core-i5-placeholder', 'معالج Intel Core i5 (نموذج)', 'Intel Core i5 (placeholder)',
  'معالج متوسط الفئة مناسب للألعاب والاستخدام اليومي — بيانات مؤقتة للعرض.', 'Mid-range CPU for gaming and everyday use — placeholder listing.',
  180, null, true, true, 1
from categories where slug = 'processors'
on conflict (slug) do nothing;

insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'amd-ryzen-5-placeholder', 'معالج AMD Ryzen 5 (نموذج)', 'AMD Ryzen 5 (placeholder)',
  'أداء قوي بسعر منافس — بيانات مؤقتة للعرض.', 'Strong performance at a competitive price — placeholder listing.',
  150, 2025000, false, true, 2
from categories where slug = 'processors'
on conflict (slug) do nothing;

-- Graphics Cards
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'rtx-4060-placeholder', 'كرت شاشة RTX 4060 (نموذج)', 'RTX 4060 (placeholder)',
  'كرت شاشة للألعاب بدقة 1440p — بيانات مؤقتة للعرض.', '1440p gaming graphics card — placeholder listing.',
  null, null, true, true, 1
from categories where slug = 'graphics-cards'
on conflict (slug) do nothing;

-- Motherboards
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'b760-motherboard-placeholder', 'لوحة أم B760 (نموذج)', 'B760 Motherboard (placeholder)',
  'لوحة أم متوافقة مع الجيل الأخير من معالجات Intel — بيانات مؤقتة.', 'Compatible with the latest Intel CPU generation — placeholder listing.',
  110, 1485000, false, true, 1
from categories where slug = 'motherboards'
on conflict (slug) do nothing;

-- RAM (with a capacity option group)
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'ddr4-ram-kit-placeholder', 'ذاكرة DDR4 (نموذج)', 'DDR4 RAM Kit (placeholder)',
  'ذاكرة عشوائية بسرعة عالية — اختر السعة المناسبة.', 'High-speed RAM kit — pick the capacity you need.',
  40, 540000, false, true, 1
from categories where slug = 'ram'
on conflict (slug) do nothing;

insert into option_groups (product_id, name_ar, name_en, kind, is_required, sort_order)
select id, 'السعة', 'Capacity', 'text', true, 1 from products where slug = 'ddr4-ram-kit-placeholder'
on conflict do nothing;

insert into option_values (group_id, label_ar, label_en, price_override_usd, price_override_syp, sort_order)
select g.id, v.label_ar, v.label_en, v.price_usd, v.price_syp, v.sort_order
from option_groups g
join products p on p.id = g.product_id and p.slug = 'ddr4-ram-kit-placeholder'
join (values
  ('8 جيجابايت', '8GB', 40::numeric, 540000::numeric, 1),
  ('16 جيجابايت', '16GB', 70::numeric, 945000::numeric, 2),
  ('32 جيجابايت', '32GB', 130::numeric, 1755000::numeric, 3)
) as v(label_ar, label_en, price_usd, price_syp, sort_order) on true;

-- Storage
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'nvme-ssd-placeholder', 'قرص SSD NVMe (نموذج)', 'NVMe SSD (placeholder)',
  'سرعة قراءة وكتابة عالية — بيانات مؤقتة للعرض.', 'High read/write speed — placeholder listing.',
  55, 742500, false, true, 1
from categories where slug = 'storage'
on conflict (slug) do nothing;

-- Power Supply
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'psu-650w-placeholder', 'مزود طاقة 650 واط (نموذج)', '650W PSU (placeholder)',
  'مزود طاقة معتمد 80+ Bronze — بيانات مؤقتة للعرض.', '80+ Bronze certified PSU — placeholder listing.',
  65, null, true, true, 1
from categories where slug = 'power-supply'
on conflict (slug) do nothing;

-- Cooling
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'air-cooler-placeholder', 'مبرد هوائي (نموذج)', 'Air Cooler (placeholder)',
  'تبريد فعال وهادئ للمعالج — بيانات مؤقتة للعرض.', 'Effective, quiet CPU cooling — placeholder listing.',
  35, 472500, false, true, 1
from categories where slug = 'cooling'
on conflict (slug) do nothing;

-- Laptops (not available example)
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'gaming-laptop-placeholder', 'لابتوب ألعاب (نموذج)', 'Gaming Laptop (placeholder)',
  'لابتوب بمعالج رسومي مخصص للألعاب — بيانات مؤقتة للعرض.', 'Dedicated-GPU gaming laptop — placeholder listing.',
  null, null, true, false, 1
from categories where slug = 'laptops'
on conflict (slug) do nothing;

-- Pre-Built PCs
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'starter-build-placeholder', 'تجميعة مبتدئين (نموذج)', 'Starter Build (placeholder)',
  'تجميعة جاهزة للألعاب الخفيفة والاستخدام اليومي — بيانات مؤقتة.', 'Ready-made build for light gaming and daily use — placeholder listing.',
  null, null, true, true, 1
from categories where slug = 'pre-built-pcs'
on conflict (slug) do nothing;

-- Accessories
insert into products (category_id, slug, name_ar, name_en, description_ar, description_en, price_usd, price_syp, price_on_request, is_available, sort_order)
select id, 'mechanical-keyboard-placeholder', 'كيبورد ميكانيكي (نموذج)', 'Mechanical Keyboard (placeholder)',
  'كيبورد ميكانيكي بإضاءة RGB — بيانات مؤقتة للعرض.', 'RGB mechanical keyboard — placeholder listing.',
  30, 405000, false, true, 1
from categories where slug = 'accessories'
on conflict (slug) do nothing;

-- Cover image (placehold.co) for every placeholder product
insert into product_images (product_id, path, sort_order)
select id,
  'https://placehold.co/800x800/141419/F4F4F5.png?text=' || replace(name_en, ' ', '+'),
  0
from products
on conflict do nothing;
