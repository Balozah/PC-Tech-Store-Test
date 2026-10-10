// Local fallback content so the site is browsable (`npm run dev`) before a
// real Supabase project exists. Mirrors supabase/seed.sql. Once
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set, lib/data.ts
// reads from Supabase instead and this file is unused.

import type { Database } from "./database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
type OptionGroup = Database["public"]["Tables"]["option_groups"]["Row"];
type OptionValue = Database["public"]["Tables"]["option_values"]["Row"];
type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export const siteSettings: SiteSettings = {
  id: 1,
  business_name_ar: "Tech RT",
  business_name_en: "Tech RT",
  whatsapp: "",
  currency: "",
  address_ar: null,
  address_en: null,
  maps_url: null,
  maps_embed_url: null,
  hours: [],
  socials: {},
};

export const categories: Category[] = [
  { id: "processors", slug: "processors", name_ar: "معالجات", name_en: "Processors", sort_order: 1, created_at: "" },
  { id: "graphics-cards", slug: "graphics-cards", name_ar: "كروت شاشة", name_en: "Graphics Cards", sort_order: 2, created_at: "" },
  { id: "motherboards", slug: "motherboards", name_ar: "لوحات أم", name_en: "Motherboards", sort_order: 3, created_at: "" },
  { id: "ram", slug: "ram", name_ar: "ذاكرة RAM", name_en: "RAM", sort_order: 4, created_at: "" },
  { id: "storage", slug: "storage", name_ar: "وحدات تخزين", name_en: "Storage", sort_order: 5, created_at: "" },
  { id: "power-supply", slug: "power-supply", name_ar: "مزودات طاقة", name_en: "Power Supply", sort_order: 6, created_at: "" },
  { id: "cooling", slug: "cooling", name_ar: "تبريد", name_en: "Cooling", sort_order: 7, created_at: "" },
  { id: "laptops", slug: "laptops", name_ar: "لابتوبات", name_en: "Laptops", sort_order: 8, created_at: "" },
  { id: "pre-built-pcs", slug: "pre-built-pcs", name_ar: "تجميعات جاهزة", name_en: "Pre-Built PCs", sort_order: 9, created_at: "" },
  { id: "accessories", slug: "accessories", name_ar: "إكسسوارات", name_en: "Accessories", sort_order: 10, created_at: "" },
];

// Real (generic, non-branded-to-a-competitor) Unsplash stock photos, one per
// category, so the catalog looks like an actual store instead of text boxes
// while real product photography isn't ready yet (see brief/brief.md TODO).
const CATEGORY_STOCK_PHOTO: Record<string, string> = {
  processors: "https://images.unsplash.com/photo-1555617981-dac3880eac6e",
  "graphics-cards": "https://images.unsplash.com/photo-1591488320449-011701bb6704",
  motherboards: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  ram: "https://images.unsplash.com/photo-1562976540-1502c2145186",
  storage: "https://images.unsplash.com/photo-1573164713988-8665fc963095",
  "power-supply": "https://images.unsplash.com/photo-1555680202-c86f0e12f086",
  cooling: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b",
  laptops: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed",
  "pre-built-pcs": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
  accessories: "https://images.unsplash.com/photo-1587831990711-23ca6441447b",
};

function img(slug: string, categoryId: string | null): ProductImage[] {
  const base = (categoryId && CATEGORY_STOCK_PHOTO[categoryId]) || CATEGORY_STOCK_PHOTO.accessories;
  return [
    {
      id: `${slug}-img-0`,
      product_id: slug,
      path: `${base}?w=800&h=800&q=80&fit=crop&auto=format`,
      sort_order: 0,
    },
  ];
}

export const products: Product[] = [
  { id: "intel-core-i5-placeholder", category_id: "processors", slug: "intel-core-i5-placeholder", name_ar: "معالج Intel Core i5 (نموذج)", name_en: "Intel Core i5 (placeholder)", description_ar: "معالج متوسط الفئة مناسب للألعاب والاستخدام اليومي — بيانات مؤقتة للعرض.", description_en: "Mid-range CPU for gaming and everyday use — placeholder listing.", price_usd: 180, price_syp: null, price_on_request: true, is_available: true, sort_order: 1, specs: [{ label_ar: "عدد الأنوية", label_en: "Cores", value: "6" }, { label_ar: "السوكيت", label_en: "Socket", value: "LGA 1700" }, { label_ar: "التردد الأقصى", label_en: "Max boost", value: "4.6 GHz" }], created_at: "", updated_at: "" },
  { id: "amd-ryzen-5-placeholder", category_id: "processors", slug: "amd-ryzen-5-placeholder", name_ar: "معالج AMD Ryzen 5 (نموذج)", name_en: "AMD Ryzen 5 (placeholder)", description_ar: "أداء قوي بسعر منافس — بيانات مؤقتة للعرض.", description_en: "Strong performance at a competitive price — placeholder listing.", price_usd: 150, price_syp: 2025000, price_on_request: false, is_available: true, sort_order: 2, specs: [], created_at: "", updated_at: "" },
  { id: "rtx-4060-placeholder", category_id: "graphics-cards", slug: "rtx-4060-placeholder", name_ar: "كرت شاشة RTX 4060 (نموذج)", name_en: "RTX 4060 (placeholder)", description_ar: "كرت شاشة للألعاب بدقة 1440p — بيانات مؤقتة للعرض.", description_en: "1440p gaming graphics card — placeholder listing.", price_usd: null, price_syp: null, price_on_request: true, is_available: true, sort_order: 1, specs: [], created_at: "", updated_at: "" },
  { id: "b760-motherboard-placeholder", category_id: "motherboards", slug: "b760-motherboard-placeholder", name_ar: "لوحة أم B760 (نموذج)", name_en: "B760 Motherboard (placeholder)", description_ar: "لوحة أم متوافقة مع الجيل الأخير من معالجات Intel — بيانات مؤقتة.", description_en: "Compatible with the latest Intel CPU generation — placeholder listing.", price_usd: 110, price_syp: 1485000, price_on_request: false, is_available: true, sort_order: 1, specs: [], created_at: "", updated_at: "" },
  { id: "ddr4-ram-kit-placeholder", category_id: "ram", slug: "ddr4-ram-kit-placeholder", name_ar: "ذاكرة DDR4 (نموذج)", name_en: "DDR4 RAM Kit (placeholder)", description_ar: "ذاكرة عشوائية بسرعة عالية — اختر السعة المناسبة.", description_en: "High-speed RAM kit — pick the capacity you need.", price_usd: 40, price_syp: 540000, price_on_request: false, is_available: true, sort_order: 1, specs: [{ label_ar: "النوع", label_en: "Type", value: "DDR4" }, { label_ar: "السرعة", label_en: "Speed", value: "3200 MHz" }, { label_ar: "زمن الاستجابة", label_en: "Latency", value: "CL16" }], created_at: "", updated_at: "" },
  { id: "nvme-ssd-placeholder", category_id: "storage", slug: "nvme-ssd-placeholder", name_ar: "قرص SSD NVMe (نموذج)", name_en: "NVMe SSD (placeholder)", description_ar: "سرعة قراءة وكتابة عالية — بيانات مؤقتة للعرض.", description_en: "High read/write speed — placeholder listing.", price_usd: 55, price_syp: 742500, price_on_request: false, is_available: true, sort_order: 1, specs: [], created_at: "", updated_at: "" },
  { id: "psu-650w-placeholder", category_id: "power-supply", slug: "psu-650w-placeholder", name_ar: "مزود طاقة 650 واط (نموذج)", name_en: "650W PSU (placeholder)", description_ar: "مزود طاقة معتمد 80+ Bronze — بيانات مؤقتة للعرض.", description_en: "80+ Bronze certified PSU — placeholder listing.", price_usd: 65, price_syp: null, price_on_request: true, is_available: true, sort_order: 1, specs: [], created_at: "", updated_at: "" },
  { id: "air-cooler-placeholder", category_id: "cooling", slug: "air-cooler-placeholder", name_ar: "مبرد هوائي (نموذج)", name_en: "Air Cooler (placeholder)", description_ar: "تبريد فعال وهادئ للمعالج — بيانات مؤقتة للعرض.", description_en: "Effective, quiet CPU cooling — placeholder listing.", price_usd: 35, price_syp: 472500, price_on_request: false, is_available: true, sort_order: 1, specs: [], created_at: "", updated_at: "" },
  { id: "gaming-laptop-placeholder", category_id: "laptops", slug: "gaming-laptop-placeholder", name_ar: "لابتوب ألعاب (نموذج)", name_en: "Gaming Laptop (placeholder)", description_ar: "لابتوب بمعالج رسومي مخصص للألعاب — بيانات مؤقتة للعرض.", description_en: "Dedicated-GPU gaming laptop — placeholder listing.", price_usd: null, price_syp: null, price_on_request: true, is_available: false, sort_order: 1, specs: [], created_at: "", updated_at: "" },
  { id: "starter-build-placeholder", category_id: "pre-built-pcs", slug: "starter-build-placeholder", name_ar: "تجميعة مبتدئين (نموذج)", name_en: "Starter Build (placeholder)", description_ar: "تجميعة جاهزة للألعاب الخفيفة والاستخدام اليومي — بيانات مؤقتة.", description_en: "Ready-made build for light gaming and daily use — placeholder listing.", price_usd: null, price_syp: null, price_on_request: true, is_available: true, sort_order: 1, specs: [], created_at: "", updated_at: "" },
  { id: "mechanical-keyboard-placeholder", category_id: "accessories", slug: "mechanical-keyboard-placeholder", name_ar: "كيبورد ميكانيكي (نموذج)", name_en: "Mechanical Keyboard (placeholder)", description_ar: "كيبورد ميكانيكي بإضاءة RGB — بيانات مؤقتة للعرض.", description_en: "RGB mechanical keyboard — placeholder listing.", price_usd: 30, price_syp: 405000, price_on_request: false, is_available: true, sort_order: 1, specs: [], created_at: "", updated_at: "" },
];

export const productImages: Record<string, ProductImage[]> = Object.fromEntries(
  products.map((p) => [p.slug, img(p.slug, p.category_id)])
);

export const optionGroups: Record<string, OptionGroup[]> = {
  "ddr4-ram-kit-placeholder": [
    { id: "ram-capacity", product_id: "ddr4-ram-kit-placeholder", name_ar: "السعة", name_en: "Capacity", kind: "text", is_required: true, sort_order: 1 },
  ],
};

export const optionValues: Record<string, OptionValue[]> = {
  "ram-capacity": [
    { id: "ram-8", group_id: "ram-capacity", label_ar: "8 جيجابايت", label_en: "8GB", hex: null, price_override_usd: 40, price_override_syp: 540000, is_available: true, sort_order: 1 },
    { id: "ram-16", group_id: "ram-capacity", label_ar: "16 جيجابايت", label_en: "16GB", hex: null, price_override_usd: 70, price_override_syp: 945000, is_available: true, sort_order: 2 },
    { id: "ram-32", group_id: "ram-capacity", label_ar: "32 جيجابايت", label_en: "32GB", hex: null, price_override_usd: 130, price_override_syp: 1755000, is_available: true, sort_order: 3 },
  ],
};
