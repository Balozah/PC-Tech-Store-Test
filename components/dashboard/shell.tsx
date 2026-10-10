"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { Icon, type IconName } from "@/components/dashboard/ui";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

const links: { href: string; label: string; short: string; icon: IconName }[] = [
  { href: "/dashboard", label: "نظرة عامة", short: "الرئيسية", icon: "home" },
  { href: "/dashboard/products", label: "المنتجات", short: "المنتجات", icon: "box" },
  { href: "/dashboard/categories", label: "الأقسام", short: "الأقسام", icon: "folder" },
  { href: "/dashboard/reviews", label: "التقييمات", short: "التقييمات", icon: "star" },
  { href: "/dashboard/settings", label: "إعدادات الموقع", short: "الإعدادات", icon: "settings" },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

// Inverts with its surface: paper on the ink sidebar, ink on the light tab bar.
function CountBadge({ count, onPaper = false }: { count: number; onPaper?: boolean }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "grid h-5 min-w-5 place-items-center px-1.5 text-[11px] font-bold leading-none tabular-nums",
        onPaper ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : "bg-[var(--color-foreground)] text-[var(--color-background)]"
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function DashboardShell({
  children,
  storeName,
  pendingReviews,
}: {
  children: React.ReactNode;
  storeName: string;
  pendingReviews: number;
}) {
  const pathname = usePathname();

  // Login: the storefront's light/dark rhythm — an ink band with the wordmark
  // beside (or above, on phones) the form on paper.
  if (pathname === "/dashboard/login") {
    return (
      <div className="grid min-h-dvh grid-rows-[auto_1fr] md:grid-cols-2 md:grid-rows-none">
        <div className="band-dark flex flex-col justify-between gap-8 px-4 py-5 md:p-10">
          <Wordmark name={storeName} className="self-start text-xl md:text-2xl" />
          <div className="hidden md:block">
            <p className="font-display text-[clamp(2.5rem,5vw,4rem)]">لوحة التحكم</p>
            <p className="mt-3 max-w-sm text-[var(--color-muted-foreground)]">المنتجات والأقسام والتقييمات وإعدادات المتجر، من مكان واحد.</p>
          </div>
        </div>
        <main className="flex items-center justify-center px-4 py-10 md:py-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar: a dark band like the storefront footer. */}
      <aside className="band-dark sticky top-0 hidden h-dvh w-64 shrink-0 flex-col p-4 md:flex">
        <div className="mb-8 border-b border-[var(--color-border)] px-2 pb-5 pt-2">
          <Wordmark name={storeName} className="text-xl" />
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">لوحة التحكم</p>
        </div>
        <nav className="flex-1 space-y-1" aria-label="أقسام لوحة التحكم">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--color-paper)] text-[var(--color-ink)]"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                )}
              >
                <Icon name={link.icon} />
                <span className="flex-1">{link.label}</span>
                {link.href === "/dashboard/reviews" && <CountBadge count={pendingReviews} onPaper={active} />}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-[var(--color-border)] pt-3">
          <a
            href="/ar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-3 px-3 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <Icon name="external" />
            عرض الموقع
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-3 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[#ff8a80]"
            >
              <Icon name="logout" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)]/85 px-4 backdrop-blur-md md:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Wordmark name={storeName} />
          <span className="truncate text-xs text-[var(--color-muted-foreground)]">لوحة التحكم</span>
        </div>
        <div className="flex items-center">
          <a
            href="/ar"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="عرض الموقع"
            className="grid h-11 w-11 place-items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <Icon name="external" />
          </a>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="تسجيل الخروج"
              className="grid h-11 w-11 cursor-pointer place-items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)]"
            >
              <Icon name="logout" />
            </button>
          </form>
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="أقسام لوحة التحكم"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-card)]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-5">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-[var(--color-ink)]" : "text-[var(--color-muted-foreground)]"
                )}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 bg-[var(--color-ink)]" />}
                <span className="relative">
                  <Icon name={link.icon} className="h-6 w-6" />
                  {link.href === "/dashboard/reviews" && pendingReviews > 0 && (
                    <span className="absolute -top-1 -end-2">
                      <CountBadge count={pendingReviews} />
                    </span>
                  )}
                </span>
                {link.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
