"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { Icon, type IconName } from "@/components/dashboard/ui";
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

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center bg-[var(--color-ink)] px-1.5 text-[11px] font-bold leading-none text-[var(--color-paper)]">
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

  if (pathname === "/dashboard/login") {
    return <div className="flex min-h-dvh items-center justify-center px-4 py-10">{children}</div>;
  }

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-[var(--color-border)] bg-[var(--color-card)] p-4 md:flex">
        <div className="mb-6 flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center bg-[var(--color-ink)] text-[var(--color-paper)]">
            <Icon name="box" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold">{storeName}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">لوحة التحكم</p>
          </div>
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
                    ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                )}
              >
                <Icon name={link.icon} />
                <span className="flex-1">{link.label}</span>
                {link.href === "/dashboard/reviews" && <CountBadge count={pendingReviews} />}
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
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-3 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)]"
            >
              <Icon name="logout" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)]/85 px-4 backdrop-blur-md md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center bg-[var(--color-ink)] text-[var(--color-paper)]">
            <Icon name="box" className="h-4 w-4" />
          </span>
          <span className="truncate font-bold">{storeName}</span>
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
