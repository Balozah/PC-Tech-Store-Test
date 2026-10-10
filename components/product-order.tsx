"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Price } from "@/components/price";
import { WhatsAppIcon } from "@/components/icons";
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
  const [barVisible, setBarVisible] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

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

  // The mobile order bar appears whenever the main order button is off screen.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setBarVisible(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const canOrder = Boolean(orderUrl) && product.is_available && allSelected;
  const label = !product.is_available
    ? t("unavailable")
    : !orderUrl
    ? t("orderUnavailable")
    : allSelected
    ? t("order")
    : t("orderDisabled");

  const buttonClass = (size: "lg" | "sm") =>
    `flex items-center justify-center gap-2 font-semibold transition-transform ${
      size === "lg" ? "min-h-14 w-full px-6" : "min-h-12 flex-1 px-4 text-sm"
    } ${
      canOrder
        ? "cursor-pointer bg-[var(--color-whatsapp)] text-[var(--color-ink)] active:scale-[0.98]"
        : "cursor-not-allowed bg-[var(--color-muted)] text-[var(--color-ink-soft)]"
    }`;

  const price = (className: string) => (
    <Price usd={usd} syp={syp} onRequest={product.price_on_request} locale={locale} className={className} />
  );

  return (
    <div>
      {price("block text-2xl font-bold tabular-nums text-[var(--color-primary)]")}

      {product.optionGroups.length > 0 && (
        <div ref={optionsRef} className="mt-6 space-y-5 scroll-mt-24">
          {product.optionGroups.map((group) => (
            <fieldset key={group.id}>
              <legend className="mb-2 text-sm font-semibold">
                {locale === "ar" ? group.name_ar : group.name_en ?? group.name_ar}
              </legend>
              <div className="flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const valueLabel = locale === "ar" ? value.label_ar : value.label_en ?? value.label_ar;
                  const isSelected = selected[group.id] === value.id;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      disabled={!value.is_available}
                      aria-pressed={isSelected}
                      onClick={() => setSelected((s) => ({ ...s, [group.id]: value.id }))}
                      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                        isSelected
                          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink)]"
                      }`}
                    >
                      {value.hex && (
                        <span className="size-4 border border-black/15" style={{ background: value.hex }} aria-hidden="true" />
                      )}
                      <bdi>{valueLabel}</bdi>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      <a
        ref={ctaRef}
        href={canOrder && orderUrl ? orderUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!canOrder}
        className={`mt-6 ${buttonClass("lg")}`}
      >
        <WhatsAppIcon className="size-5" />
        {label}
      </a>
      {canOrder && <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{t("orderHint")}</p>}

      {orderUrl && product.is_available && (
        <div
          className="order-bar fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
          data-visible={barVisible}
          aria-hidden={!barVisible}
          inert={!barVisible}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-[var(--color-ink-soft)]">{name}</p>
              {price("block truncate text-sm font-bold tabular-nums text-[var(--color-primary)]")}
            </div>
            {!allSelected ? (
              <button
                type="button"
                onClick={() => optionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center bg-[var(--color-ink)] px-4 text-sm font-semibold text-[var(--color-paper)]"
              >
                {t("orderDisabled")}
              </button>
            ) : (
              <a
                href={canOrder && orderUrl ? orderUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!canOrder}
                className={buttonClass("sm")}
              >
                <WhatsAppIcon className="size-5" />
                {canOrder ? t("orderShort") : label}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
