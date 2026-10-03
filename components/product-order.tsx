"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Price } from "@/components/price";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { Locale } from "@/i18n/routing";
import type { ProductWithRelations } from "@/lib/data";

export function ProductOrder({
  product,
  whatsappNumber,
  productUrl,
  locale,
}: {
  product: ProductWithRelations;
  whatsappNumber: string | null;
  productUrl: string;
  locale: Locale;
}) {
  const t = useTranslations("product");
  const [selected, setSelected] = useState<Record<string, string>>({});

  const requiredGroups = product.optionGroups.filter((g) => g.is_required);
  const allSelected = requiredGroups.every((g) => selected[g.id]);

  const { usd, syp } = useMemo(() => {
    let usd = product.price_usd;
    let syp = product.price_syp;
    for (const group of product.optionGroups) {
      const valueId = selected[group.id];
      const value = group.values.find((v) => v.id === valueId);
      if (value?.price_override_usd != null) usd = value.price_override_usd;
      if (value?.price_override_syp != null) syp = value.price_override_syp;
    }
    return { usd, syp };
  }, [selected, product]);

  const name = locale === "ar" ? product.name_ar : product.name_en ?? product.name_ar;

  const orderUrl = buildWhatsAppOrderUrl({
    whatsappNumber,
    productName: name,
    options: product.optionGroups.map((g) => {
      const value = g.values.find((v) => v.id === selected[g.id]);
      return {
        groupLabel: locale === "ar" ? g.name_ar : g.name_en ?? g.name_ar,
        valueLabel: value ? (locale === "ar" ? value.label_ar : value.label_en ?? value.label_ar) : "",
      };
    }).filter((o) => o.valueLabel),
    priceLabel: product.price_on_request ? null : (usd != null ? `$${usd}` : null),
    productUrl,
    locale,
  });

  return (
    <div>
      {product.optionGroups.map((group) => (
        <fieldset key={group.id} className="mb-5">
          <legend className="mb-2 text-sm font-semibold">
            {locale === "ar" ? group.name_ar : group.name_en ?? group.name_ar}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const label = locale === "ar" ? value.label_ar : value.label_en ?? value.label_ar;
              const isSelected = selected[group.id] === value.id;
              return (
                <button
                  key={value.id}
                  type="button"
                  disabled={!value.is_available}
                  onClick={() => setSelected((s) => ({ ...s, [group.id]: value.id }))}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <Price
        usd={usd}
        syp={syp}
        onRequest={product.price_on_request}
        locale={locale}
        className="block text-2xl font-bold text-[var(--color-primary)]"
      />

      <a
        href={product.is_available && allSelected ? orderUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!product.is_available || !allSelected}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-transform ${
          product.is_available && allSelected
            ? "cursor-pointer bg-[var(--color-success)] text-black hover:scale-[1.02]"
            : "cursor-not-allowed bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
        }`}
      >
        {!product.is_available
          ? t("unavailable")
          : allSelected
          ? t("order")
          : t("orderDisabled")}
      </a>
    </div>
  );
}
