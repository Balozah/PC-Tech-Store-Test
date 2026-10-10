import { useTranslations } from "next-intl";
import type { Database } from "@/lib/database.types";
import { whatsAppChatUrl } from "@/lib/whatsapp";
import { SOCIAL_PLATFORMS, type Hours } from "@/lib/site-settings";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export function Footer({ settings, locale }: { settings: SiteSettings; locale: string }) {
  const t = useTranslations("footer");
  const isAr = locale === "ar";

  const name = isAr ? settings.business_name_ar : settings.business_name_en || settings.business_name_ar;
  const address = isAr ? settings.address_ar : settings.address_en || settings.address_ar;
  const hours = Array.isArray(settings.hours) ? (settings.hours as unknown as Hours[]) : [];
  const socialsRaw = (settings.socials ?? {}) as Record<string, string>;
  const socials = SOCIAL_PLATFORMS.filter((p) => socialsRaw[p.key]);
  const chatUrl = whatsAppChatUrl(settings.whatsapp);

  const hasContact = Boolean(chatUrl || address || settings.maps_url);

  return (
    <footer id="contact" className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-bold">{name}</h3>
          {socials.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-semibold text-[var(--color-muted-foreground)]">{t("follow")}</h4>
              <ul className="flex flex-wrap gap-2">
                {socials.map((p) => (
                  <li key={p.key}>
                    <a
                      href={socialsRaw[p.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-4 text-sm hover:border-[var(--color-primary)]"
                    >
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {hasContact && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-[var(--color-muted-foreground)]">{t("contact")}</h4>
            <ul className="space-y-2 text-sm">
              {chatUrl && (
                <li>
                  <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)]">
                    {t("whatsapp")}: <bdi dir="ltr">+{settings.whatsapp!.replace(/\D/g, "")}</bdi>
                  </a>
                </li>
              )}
              {address && <li>{address}</li>}
              {settings.maps_url && (
                <li>
                  <a href={settings.maps_url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                    {t("openInMaps")}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        {hours.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-[var(--color-muted-foreground)]">{t("hours")}</h4>
            <ul className="space-y-1 text-sm">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{t(`days.${h.day}`)}</span>
                  <span className="text-[var(--color-muted-foreground)]">
                    {h.closed ? t("closed") : <bdi dir="ltr">{`${h.open} - ${h.close}`}</bdi>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {settings.maps_embed_url && (
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <iframe
            src={settings.maps_embed_url}
            title={t("mapTitle")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full rounded-2xl border border-[var(--color-border)]"
          />
        </div>
      )}

      <div className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-muted-foreground)]">
        © {new Date().getFullYear()} {name} — {t("rights")}
      </div>
    </footer>
  );
}
