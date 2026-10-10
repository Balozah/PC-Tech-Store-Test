import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { Price } from "@/components/price";
import { ArrowIcon } from "@/components/icons";
import { productImageUrl } from "@/lib/product-image";
import type { Product, ProductImage } from "@/lib/data";
import type { Locale } from "@/i18n/routing";

export type SpecRow = { label: string; value: string };

// The page's one bold element (DESIGN.md): a full-bleed dark band that cuts
// into the light hero with a notch at its inline-end corner.
export function Spotlight({
  product,
  image,
  specs,
  locale,
}: {
  product: Product;
  image?: ProductImage;
  specs: SpecRow[];
  locale: Locale;
}) {
  const t = useTranslations("spotlight");
  const name = locale === "ar" ? product.name_ar : product.name_en ?? product.name_ar;
  const description = locale === "ar" ? product.description_ar : product.description_en ?? product.description_ar;
  const href = `/products/${product.slug}`;

  return (
    <section
      aria-labelledby="spotlight-title"
      className="band-dark relative before:absolute before:-top-10 before:end-0 before:h-10 before:w-[42%] before:bg-[var(--color-background)] md:before:-top-14 md:before:h-14"
    >
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:pb-24 md:pt-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <h2 id="spotlight-title" className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            {t("title")}
          </h2>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline hover:underline-offset-4"
          >
            {t("cta")}
            <ArrowIcon className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>

        <div className="mt-10 grid items-center gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5">
            <h3 className="font-display text-[clamp(2rem,5vw,3.75rem)]">{name}</h3>
            <Price
              usd={product.price_usd}
              syp={product.price_syp}
              onRequest={product.price_on_request}
              locale={locale}
              className="mt-5 block text-xl font-bold tabular-nums text-[var(--color-primary)]"
            />
            <Link
              href={href}
              className="mt-8 inline-flex min-h-12 items-center gap-2 bg-[var(--color-paper)] px-6 font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-on-dark)] active:scale-[0.98]"
            >
              {t("cta")}
              <ArrowIcon className="size-4 rtl:-scale-x-100" />
            </Link>
          </Reveal>

          {image && (
            <Reveal index={1} className="relative aspect-square w-full bg-[var(--color-surface)] md:col-span-4">
              <Image
                src={productImageUrl(image.path)}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-6"
              />
            </Reveal>
          )}

          <div className={image ? "md:col-span-3" : "md:col-span-7"}>
            {specs.length > 0 ? (
              <dl aria-label={t("specs")}>
                {specs.map((s, i) => (
                  <Reveal key={s.label} index={i + 1} step={60} className="border-b border-[var(--color-border)] py-3">
                    <dt className="text-sm text-[var(--color-muted-foreground)]">{s.label}</dt>
                    <dd className="mt-0.5 font-semibold">
                      <bdi>{s.value}</bdi>
                    </dd>
                  </Reveal>
                ))}
              </dl>
            ) : (
              description && (
                <Reveal index={2}>
                  <p className="text-[var(--color-muted-foreground)]">{description}</p>
                </Reveal>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
