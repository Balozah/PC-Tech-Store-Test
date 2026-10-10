import Link from "next/link";
import Image from "next/image";
import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { Badge, Card, Icon, PageHeader, buttonClass, formatAdminPrice, type IconName } from "@/components/dashboard/ui";
import { getCardExtras, getCategories, getProducts, getSiteSettings, isSupabaseConfigured } from "@/lib/data";
import { getPendingReviewCount } from "@/lib/data-admin";
import { productImageUrl } from "@/lib/product-image";

function Stat({ href, icon, label, value, tone }: { href: string; icon: IconName; label: string; value: number; tone?: "warning" | "danger" }) {
  const toneClass =
    tone === "warning"
      ? "bg-[#b45309]/12 text-[#92400e]"
      : tone === "danger"
      ? "bg-[var(--color-destructive)]/12 text-[var(--color-destructive)]"
      : "bg-[var(--color-primary)]/15 text-[var(--color-primary)]";
  return (
    <Link
      href={href}
      className="group border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition-colors hover:border-[var(--color-primary)]/60"
    >
      <span className={`mb-3 grid h-10 w-10 place-items-center ${toneClass}`}>
        <Icon name={icon} />
      </span>
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">{label}</p>
    </Link>
  );
}

export default async function DashboardOverview() {
  const configured = isSupabaseConfigured();
  const [categories, products, settings, pending] = await Promise.all([
    getCategories(),
    getProducts(),
    getSiteSettings(),
    configured ? getPendingReviewCount() : Promise.resolve(0),
  ]);

  const unavailable = products.filter((p) => !p.is_available).length;
  const recent = [...products]
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 5);
  const extras = await getCardExtras(recent);

  const hours = Array.isArray(settings.hours) ? settings.hours : [];
  const setup = [
    { done: Boolean(settings.whatsapp), label: "رقم الواتساب", hint: "بدونه زر الطلب مسكّر بالموقع" },
    { done: Boolean(settings.address_ar), label: "العنوان" },
    { done: Boolean(settings.maps_url), label: "رابط الخريطة" },
    { done: hours.length > 0, label: "ساعات الدوام" },
    { done: Object.keys(settings.socials ?? {}).length > 0, label: "روابط السوشال" },
  ];
  const missing = setup.filter((s) => !s.done);

  return (
    <div className="space-y-6">
      <PageHeader
        title="نظرة عامة"
        description="هون بتدير منتجات المتجر وأقسامه وتقييماته."
        actions={
          <Link href="/dashboard/products/new" className={buttonClass.primary}>
            <Icon name="plus" className="h-4 w-4" />
            منتج جديد
          </Link>
        }
      />
      {!configured && <SupabaseNotice />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat href="/dashboard/products" icon="box" label="منتج" value={products.length} />
        <Stat href="/dashboard/categories" icon="folder" label="قسم" value={categories.length} />
        <Stat href="/dashboard/products" icon="alert" label="غير متوفر" value={unavailable} tone={unavailable ? "danger" : undefined} />
        <Stat href="/dashboard/reviews" icon="star" label="تقييم بانتظارك" value={pending} tone={pending ? "warning" : undefined} />
      </div>

      {missing.length > 0 && (
        <Card
          title="كمّل معلومات المتجر"
          description={`${setup.length - missing.length} من ${setup.length} جاهزين`}
          action={
            <Link href="/dashboard/settings" className={buttonClass.secondary}>
              الإعدادات
            </Link>
          }
        >
          <div className="mb-4 h-1.5 overflow-hidden bg-[var(--color-muted)]">
            <div
              className="h-full bg-[var(--color-ink)] transition-[width]"
              style={{ width: `${((setup.length - missing.length) / setup.length) * 100}%` }}
            />
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {setup.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                    item.done ? "bg-[var(--color-success)] text-white" : "border border-[var(--color-border)]"
                  }`}
                >
                  {item.done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span>
                  <span className={item.done ? "text-[var(--color-muted-foreground)] line-through" : ""}>{item.label}</span>
                  {!item.done && item.hint && <span className="block text-xs text-[#92400e]">{item.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card
        title="آخر المنتجات"
        action={
          <Link href="/dashboard/products" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
            عرض الكل
          </Link>
        }
      >
        <ul className="-mx-2 divide-y divide-[var(--color-border)]">
          {recent.map((p) => {
            const image = extras[p.slug]?.image;
            return (
              <li key={p.id}>
                <Link href={`/dashboard/products/${p.id}`} className="flex items-center gap-3 px-2 py-2.5 transition-colors hover:bg-[var(--color-muted)]">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-[var(--color-muted)]">
                    {image ? (
                      <Image src={productImageUrl(image.path)} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <Icon name="image" className="absolute inset-0 m-auto text-[var(--color-muted-foreground)]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name_ar}</span>
                    <span className="block text-xs text-[var(--color-muted-foreground)]">
                      {formatAdminPrice(p.price_usd, p.price_syp, p.price_on_request)}
                    </span>
                  </span>
                  {!p.is_available && <Badge tone="danger">غير متوفر</Badge>}
                  <Icon name="chevron" className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
