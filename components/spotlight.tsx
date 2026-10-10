import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { Price } from "@/components/price";
import { productImageUrl } from "@/lib/product-image";
import type { Product, ProductImage } from "@/lib/data";
import type { Locale } from "@/i18n/routing";

export function Spotlight({
  product,
  image,
  locale,
}: {
  product: Product;
  image?: ProductImage;
  locale: Locale;
}) {
  const t = useTranslations("spotlight");
  const name = locale === "ar" ? product.name_ar : product.name_en ?? product.name_ar;

  return (
    <section className="bg-black text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {name}
          </h2>
          <Price
            usd={product.price_usd}
            syp={product.price_syp}
            onRequest={product.price_on_request}
            locale={locale}
            className="mt-4 block text-xl font-semibold text-[var(--color-accent)]"
          />
          <Link
            href={`/products/${product.slug}`}
            className="mt-6 inline-block rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            {t("cta")}
          </Link>
        </Reveal>
        <Reveal index={1} className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[var(--color-muted)]">
          {image && (
            <Image
              src={productImageUrl(image.path)}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </Reveal>
      </div>
    </section>
  );
}
