import { DM_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { connection } from "next/server";
import { DashboardShell } from "@/components/dashboard/shell";
import "@/app/globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body-latin-next" });
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic-next",
});

export const metadata = { title: "لوحة تحكم Tech RT" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Admin pages must always show live data, never a build-time snapshot.
  await connection();

  return (
    <html lang="ar" dir="rtl" className={`${dmSans.variable} ${plexArabic.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-foreground)]">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
