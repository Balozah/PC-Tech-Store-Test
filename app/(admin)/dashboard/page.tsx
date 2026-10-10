import Link from "next/link";
import Image from "next/image";
import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { Badge, Card, Icon, PageHeader, buttonClass, formatAdminPrice, type IconName } from "@/components/dashboard/ui";
import { getCardExtras, getCategories, getProducts, getSiteSettings, isSupabaseConfigured } from "@/lib/data";
import { getPendingReviewCount } from "@/lib/data-admin";
import { productImageUrl } from "@/lib/product-image";

// Blueprint cells like the storefront category grid: hairline grid, oversized
// figures, hover inverts to ink. A count that needs attention gets a tag.
function Stat({ href, icon, label, value, alert }: { href: string; icon: IconName; label: string; value: number; alert?: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-36 flex-col justify-between bg-[var(--color-background)] p-4 transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] sm:p-5"
    >
      <span className="flex items-start justify-between gap-2">
        <Icon name={icon} className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
        {alert && value > 0 && (
          <span className="bg-[var(--color-ink)] px-2 py-0.5 text-xs font-semibold text-[var(--color-paper)] group-hover:bg-[var(--color-paper)] group-hover:text-[var(--color-ink)]">
            {alert}
          </span>
        )}
      </span>
      <span>
        <span className="font-display block text-[clamp(2.25rem,5vw,3rem)] leading-none tabular-nums">{value}</span>
        <span className="mt-2 block text-sm text-[var(--color-ink-soft)] transition-colors group-hover:text-[var(--color-on-dark-soft)]">{label}</span>
      </span>
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

      <div className="grid grid-cols-2 gap-px border border-[var(--color-border)] bg-[var(--color-border)] lg:grid-cols-4">
        <Stat href="/dashboard/products" icon="box" label="منتج" value={products.length} />
        <Stat href="/dashboard/categories" icon="folder" label="قسم" value={categories.length} />
        <Stat href="/dashboard/products" icon="alert" label="غير متوفر" value={unavailable} alert="راجعها" />
        <Stat href="/dashboard/reviews" icon="star" label="تقييم بانتظارك" value={pending} alert="جديد" />
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
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center ${
                    item.done ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : "border border-[var(--color-ink-soft)]"
                  }`}
                >
                  {item.done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span>
                  <span className={item.done ? "text-[var(--color-muted-foreground)] line-through" : ""}>{item.label}</span>
                  {!item.done && item.hint && <span className="block text-xs font-medium text-[var(--color-destructive)]">{item.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card
        title="آخر المنتجات"
        action={
          <Link
            href="/dashboard/products"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:underline hover:underline-offset-4"
          >
            عرض الكل
            <Icon name="chevron" className="h-4 w-4" />
          </Link>
        }
      >
        <ul className="-mx-2 divide-y divide-[var(--color-border)]">
          {recent.map((p) => {
            const image = extras[p.slug]?.image;
            return (
              <li key={p.id}>
                <Link href={`/dashboard/products/${p.id}`} className="flex items-center gap-3 px-2 py-2.5 transition-colors hover:bg-[var(--color-muted)]">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
                    {image ? (
                      <Image src={productImageUrl(image.path)} alt="" fill sizes="48px" className="object-contain p-1" />
                    ) : (
                      <Icon name="image" className="absolute inset-0 m-auto text-[var(--color-muted-foreground)]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name_ar}</span>
                    <span className="block text-xs font-semibold tabular-nums text-[var(--color-primary)]">
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
