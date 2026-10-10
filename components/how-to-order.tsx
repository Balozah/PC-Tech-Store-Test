import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { WhatsAppIcon } from "@/components/icons";

// The three steps are a real sequence (browse → options → WhatsApp), so the
// numbers carry information here.
export function HowToOrder({ chatUrl }: { chatUrl: string | null }) {
  const t = useTranslations("howTo");
  const steps = [1, 2, 3].map((n) => ({ n, title: t(`step${n}Title`), text: t(`step${n}Text`) }));

  return (
    <section aria-labelledby="how-title" className="border-t border-[var(--color-border)]">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <h2 id="how-title" className="font-display text-[clamp(1.75rem,4vw,3rem)]">
            {t("title")}
          </h2>
          <div className="mt-8 border-t border-[var(--color-border)] pt-6">
            <p className="font-semibold">{t("helpTitle")}</p>
            <p className="mt-1 text-[var(--color-ink-soft)]">{t("helpText")}</p>
            {chatUrl ? (
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 items-center gap-2 bg-[var(--color-whatsapp)] px-5 font-semibold text-[var(--color-ink)] transition-transform active:scale-[0.98]"
              >
                <WhatsAppIcon className="size-5" />
                {t("helpCta")}
              </a>
            ) : (
              <Link href="/#contact" className="mt-4 inline-block font-semibold text-[var(--color-primary)] underline underline-offset-4">
                {t("helpCta")}
              </Link>
            )}
          </div>
        </div>

        <ol className="grid gap-px bg-[var(--color-border)] md:grid-cols-3 lg:col-span-8">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} index={i} step={80} className="bg-[var(--color-background)] py-6 md:px-6 md:py-0 md:first:ps-0">
              <span className="font-display block text-5xl tabular-nums text-[var(--color-line)]" aria-hidden="true">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg">{s.title}</h3>
              <p className="mt-2 text-[var(--color-ink-soft)]">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
