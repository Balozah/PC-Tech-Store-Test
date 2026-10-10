import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { getSiteSettings, isSupabaseConfigured } from "@/lib/data";
import { getPendingReviewCount } from "@/lib/data-admin";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "لوحة التحكم", template: "%s · لوحة التحكم" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f2f2ef", viewportFit: "cover" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Admin pages must always show live data, never a build-time snapshot.
  await connection();

  const [settings, pendingReviews] = await Promise.all([
    getSiteSettings(),
    isSupabaseConfigured() ? getPendingReviewCount() : Promise.resolve(0),
  ]);

  return (
    <html lang="ar" dir="rtl" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-foreground)]">
        <DashboardShell storeName={settings.business_name_ar} pendingReviews={pendingReviews}>
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}
