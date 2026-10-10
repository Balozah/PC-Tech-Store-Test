import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/components/icons";

// Rendered inside the locale layout (header, footer, fonts) whenever a page
// calls notFound(): removed products, unknown categories. Visitors often land
// here from an old WhatsApp link, so the way back is the main action.
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-32">
      <p className="font-display text-[clamp(4rem,14vw,9rem)] leading-none tabular-nums text-[var(--color-line)]" aria-hidden="true">
        404
      </p>
      <h1 className="font-display mt-6 text-[clamp(1.75rem,4vw,3rem)]">{t("title")}</h1>
      <p className="mt-3 max-w-[34rem] text-lg text-[var(--color-ink-soft)]">{t("text")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 bg-[var(--color-ink)] px-6 font-semibold text-[var(--color-paper)] transition-colors hover:bg-[var(--color-primary)] active:scale-[0.98]"
        >
          {t("home")}
          <ArrowIcon className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}
