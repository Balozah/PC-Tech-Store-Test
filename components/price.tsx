import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/whatsapp";
import type { Locale } from "@/i18n/routing";

export function Price({
  usd,
  syp,
  onRequest,
  locale,
  className,
}: {
  usd: number | null;
  syp: number | null;
  onRequest: boolean;
  locale: Locale;
  className?: string;
}) {
  const t = useTranslations("product");

  if (onRequest || (usd == null && syp == null)) {
    return <span className={className}>{t("priceOnRequest")}</span>;
  }

  return <span className={className}>{formatPrice(usd, syp, locale)}</span>;
}
