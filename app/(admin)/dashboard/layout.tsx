import type { Metadata, Viewport } from "next";
import { DM_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { connection } from "next/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { getSiteSettings, isSupabaseConfigured } from "@/lib/data";
import { getPendingReviewCount } from "@/lib/data-admin";
import "@/app/globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body-latin-next" });
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic-next",
});

export const metadata: Metadata = {
  title: { default: "لوحة التحكم", template: "%s · لوحة التحكم" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0a0a0f", viewportFit: "cover" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Admin pages must always show live data, never a build-time snapshot.
  await connection();

  const [settings, pendingReviews] = await Promise.all([
    getSiteSettings(),
    isSupabaseConfigured() ? getPendingReviewCount() : Promise.resolve(0),
  ]);

  return (
    <html lang="ar" dir="rtl" className={`${dmSans.variable} ${plexArabic.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-foreground)]">
        <DashboardShell storeName={settings.business_name_ar} pendingReviews={pendingReviews}>
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}
