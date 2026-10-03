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
}: {
  product: Product;
  image?: ProductImage;
  rating?: { average: number; count: number };
  locale: Locale;
}) {
  const t = useTranslations("product");
  const name = locale === "ar" ? product.name_ar : product.name_en ?? product.name_ar;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-light)] text-[var(--color-card-light-foreground)] transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-muted)]">
        {image && (
          <Image
            src={productImageUrl(image.path)}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {!product.is_available && (
          <span className="absolute top-2 start-2 rounded-full bg-[var(--color-destructive)] px-2.5 py-1 text-xs font-semibold text-white">
            {t("unavailable")}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold">{name}</h3>
        <Price
          usd={product.price_usd}
          syp={product.price_syp}
          onRequest={product.price_on_request}
          locale={locale}
          className="mt-1 block text-sm font-medium text-[var(--color-primary)]"
        />
        {rating && rating.count > 0 && (
          <div className="mt-1.5">
            <StarRating value={rating.average} count={rating.count} size={13} />
          </div>
        )}
      </div>
    </Link>
  );
}
