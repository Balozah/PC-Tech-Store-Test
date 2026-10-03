import type { Locale } from "@/i18n/routing";

export type SelectedOption = {
  groupLabel: string;
  valueLabel: string;
};

export function formatPrice(usd: number | null, syp: number | null, locale: Locale) {
  if (usd == null && syp == null) return null;
  const parts: string[] = [];
  if (usd != null) parts.push(`$${usd.toLocaleString(locale === "ar" ? "ar" : "en")}`);
  if (syp != null) parts.push(`${syp.toLocaleString(locale === "ar" ? "ar" : "en")} ${locale === "ar" ? "ل.س" : "SYP"}`);
  return parts.join(" / ");
}

export function buildWhatsAppOrderUrl(opts: {
  whatsappNumber: string | null;
  productName: string;
  options: SelectedOption[];
  priceLabel: string | null;
  productUrl: string;
  locale: Locale;
}) {
  const { whatsappNumber, productName, options, priceLabel, productUrl, locale } = opts;
  const isAr = locale === "ar";

  const lines = [
    isAr ? "مرحباً، بدي اطلب:" : "Hi, I'd like to order:",
    `${isAr ? "المنتج" : "Product"}: ${productName}`,
    ...options.map((o) => `${o.groupLabel}: ${o.valueLabel}`),
    `${isAr ? "السعر" : "Price"}: ${priceLabel ?? (isAr ? "عند الطلب" : "on request")}`,
    `${isAr ? "الرابط" : "Link"}: ${productUrl}`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  const number = whatsappNumber?.replace(/\D/g, "") || "000000000000"; // TODO: real WhatsApp number pending
  return `https://wa.me/${number}?text=${text}`;
}
