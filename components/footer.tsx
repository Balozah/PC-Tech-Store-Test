import { useTranslations } from "next-intl";
import type { Database } from "@/lib/database.types";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
type Hours = { day: string; open: string; close: string; closed: boolean };

export function Footer({ settings, locale }: { settings: SiteSettings; locale: string }) {
  const t = useTranslations("footer");
  const hours = (settings.hours as unknown as Hours[]) ?? [];
  const address = locale === "ar" ? settings.address_ar : settings.address_en ?? settings.address_ar;

  return (
    <footer id="contact" className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="font-[var(--font-heading)] text-lg font-bold">{settings.business_name_ar}</h3>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-[var(--color-muted-foreground)]">
            {t("contact")}
          </h4>
          <p className="text-sm">
            {settings.whatsapp || t("whatsappTodo")}
          </p>
          <p className="mt-1 text-sm">{address || t("addressTodo")}</p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-[var(--color-muted-foreground)]">
            {t("hours")}
          </h4>
          {hours.length ? (
            <ul className="space-y-1 text-sm">
              {hours.map((h) => (
                <li key={h.day}>
                  {h.day}: {h.closed ? "—" : `${h.open} - ${h.close}`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">{t("hoursTodo")}</p>
          )}
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-muted-foreground)]">
        © {new Date().getFullYear()} {settings.business_name_en ?? settings.business_name_ar} — {t("rights")}
      </div>
    </footer>
  );
}
