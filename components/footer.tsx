import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/header";
import { WhatsAppIcon } from "@/components/icons";
import type { Database } from "@/lib/database.types";
import type { Category } from "@/lib/data";
import { whatsAppChatUrl } from "@/lib/whatsapp";
import { SOCIAL_PLATFORMS, type Hours } from "@/lib/site-settings";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export function Footer({
  settings,
  categories,
  locale,
}: {
  settings: SiteSettings;
  categories: Category[];
  locale: string;
}) {
  const t = useTranslations("footer");
  const tb = useTranslations("brand");
  const th = useTranslations("hero");
  const isAr = locale === "ar";

  const name = isAr ? settings.business_name_ar : settings.business_name_en || settings.business_name_ar;
  const address = isAr ? settings.address_ar : settings.address_en || settings.address_ar;
  const hours = Array.isArray(settings.hours) ? (settings.hours as unknown as Hours[]) : [];
  const socialsRaw = (settings.socials ?? {}) as Record<string, string>;
  const socials = SOCIAL_PLATFORMS.filter((p) => socialsRaw[p.key]);
  const chatUrl = whatsAppChatUrl(settings.whatsapp);
  const hasContact = Boolean(chatUrl || address || settings.maps_url || socials.length);

  const heading = "mb-4 text-sm font-semibold text-[var(--color-muted-foreground)]";

  return (
    <footer id="contact" className="band-dark">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-14 sm:px-6 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <Wordmark name={tb("name")} className="text-2xl" />
          <p className="mt-4 max-w-sm text-[var(--color-muted-foreground)]">{th("subtitle")}</p>
          {chatUrl && (
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center gap-2 bg-[var(--color-whatsapp)] px-5 font-semibold text-[var(--color-ink)] transition-transform active:scale-[0.98]"
            >
              <WhatsAppIcon className="size-5" />
              {t("chat")}
            </a>
          )}
        </div>

        {categories.length > 0 && (
          <nav aria-label={t("categories")} className="md:col-span-4">
            <h2 className={heading}>{t("categories")}</h2>
            <ul className="grid grid-cols-2 gap-x-6">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="flex min-h-11 items-center transition-colors hover:text-[var(--color-primary)]"
                  >
                    {isAr ? c.name_ar : c.name_en ?? c.name_ar}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {(hasContact || hours.length > 0) && (
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-4 md:grid-cols-1">
            {hasContact && (
              <div>
                <h2 className={heading}>{t("contact")}</h2>
                <ul className="space-y-2">
                  {chatUrl && (
                    <li>
                      <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)]">
                        {t("whatsapp")}: <bdi dir="ltr" className="tabular-nums">+{settings.whatsapp!.replace(/\D/g, "")}</bdi>
                      </a>
                    </li>
                  )}
                  {address && <li>{address}</li>}
                  {settings.maps_url && (
                    <li>
                      <a
                        href={settings.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-primary)] underline underline-offset-4"
                      >
                        {t("openInMaps")}
                      </a>
                    </li>
                  )}
                </ul>
                {socials.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label={t("follow")}>
                    {socials.map((p) => (
                      <li key={p.key}>
                        <a
                          href={socialsRaw[p.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center border border-[var(--color-border)] px-4 text-sm transition-colors hover:border-[var(--color-foreground)]"
                        >
                          {p.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {hours.length > 0 && (
              <div>
                <h2 className={heading}>{t("hours")}</h2>
                <ul className="space-y-1 text-sm">
                  {hours.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4 border-b border-[var(--color-border)] py-1.5">
                      <span>{t(`days.${h.day}`)}</span>
                      <span className="text-[var(--color-muted-foreground)]">
                        {h.closed ? t("closed") : <bdi dir="ltr" className="tabular-nums">{`${h.open} - ${h.close}`}</bdi>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {settings.maps_embed_url && (
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <iframe
            src={settings.maps_embed_url}
            title={t("mapTitle")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full border border-[var(--color-border)] grayscale"
          />
        </div>
      )}

      <div className="border-t border-[var(--color-border)]">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-[var(--color-muted-foreground)] sm:px-6">
          © <span className="tabular-nums">{new Date().getFullYear()}</span> {name} · {t("rights")}
        </p>
      </div>
    </footer>
  );
}
