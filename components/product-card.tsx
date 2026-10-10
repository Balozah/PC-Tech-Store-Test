import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Price } from "@/components/price";
import { StarRating } from "@/components/star-rating";
import type { Product, ProductImage } from "@/lib/data";
import { productImageUrl } from "@/lib/product-image";
import type { Locale } from "@/i18n/routing";

export function ProductCard({
  product,
  image,
  rating,
  locale,
  priority,
}: {
  product: Product;
  image?: ProductImage;
  rating?: { average: number; count: number };
  locale: Locale;
  priority?: boolean;
}) {
  const t = useTranslations("product");
  const name = locale === "ar" ? product.name_ar : product.name_en ?? product.name_ar;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] transition-[border-color,transform] duration-200 hover:border-[var(--color-ink)] active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-surface)]">
        {image && (
          <Image
            src={productImageUrl(image.path)}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.04] sm:p-5"
          />
        )}
        {!product.is_available && (
          <span className="absolute start-0 top-0 bg-[var(--color-ink)] px-2.5 py-1 text-xs font-semibold text-[var(--color-paper)]">
            {t("unavailable")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-[var(--color-border)] p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">{name}</h3>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
          <Price
            usd={product.price_usd}
            syp={product.price_syp}
            onRequest={product.price_on_request}
            locale={locale}
            className="text-sm font-bold tabular-nums text-[var(--color-primary)]"
          />
          {rating && rating.count > 0 && <StarRating value={rating.average} count={rating.count} size={12} />}
        </div>
      </div>
    </Link>
  );
}
