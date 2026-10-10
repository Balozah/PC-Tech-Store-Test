import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { DitherHeroVisual } from "@/components/ui/dither-hero-visual";

// Static, owner-independent hero photo (monochrome case shot, public/hero).
const HERO_IMAGE = "/hero/case.webp";

export function Hero({ chatUrl, prebuiltHref }: { chatUrl: string | null; prebuiltHref: string }) {
  const t = useTranslations("hero");
  const lines = [t("line1"), t("line2")];

  const paths = [
    { title: t("prebuiltTitle"), text: t("prebuiltText"), href: prebuiltHref },
    { title: t("partsTitle"), text: t("partsText"), href: "/#categories" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-10 sm:px-6 md:pb-28 md:pt-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 lg:self-center">
          <h1 className="font-display text-[clamp(2.25rem,6.4vw,4rem)] lg:text-[clamp(2.5rem,4.4vw,3.6rem)]">
            {lines.map((line, i) => (
              <span key={i} className="line-mask">
                <span style={{ "--line-delay": `${i * 90}ms` } as CSSProperties}>{line}</span>
              </span>
            ))}
          </h1>
          <div className="enter" style={{ "--enter-delay": "260ms" } as CSSProperties}>
            <p className="mt-6 max-w-[34rem] text-lg text-[var(--color-ink-soft)]">{t("subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#categories"
                className="inline-flex min-h-12 items-center gap-2 bg-[var(--color-ink)] px-6 font-semibold text-[var(--color-paper)] transition-colors hover:bg-[var(--color-primary)] active:scale-[0.98]"
              >
                {t("cta")}
                <ArrowIcon className="size-4 rtl:-scale-x-100" />
              </Link>
              {chatUrl && (
                <a
                  href={chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 border border-[var(--color-ink)] px-6 font-semibold transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] active:scale-[0.98]"
                >
                  <WhatsAppIcon className="size-5" />
                  {t("ctaWhatsapp")}
                </a>
              )}
            </div>
          </div>
        </div>

        <DitherHeroVisual src={HERO_IMAGE} alt={t("imageAlt")} className="lg:col-span-4 lg:self-center" />

        <ul
          className="grid self-center border-b border-[var(--color-border)] sm:grid-cols-2 sm:gap-x-6 lg:col-span-3 lg:grid-cols-1"
        >
          {paths.map((p, i) => (
            <li
              key={p.title}
              className="enter border-t border-[var(--color-border)]"
              style={{ "--enter-delay": `${400 + i * 90}ms` } as CSSProperties}
            >
              <Link href={p.href} className="group block py-5 lg:ps-2">
                <span className="flex items-center justify-between gap-3">
                  <span className="font-display text-xl">{p.title}</span>
                  <ArrowIcon className="size-5 transition-transform duration-200 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </span>
                <span className="mt-2 block text-[0.9375rem] text-[var(--color-ink-soft)]">{p.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
