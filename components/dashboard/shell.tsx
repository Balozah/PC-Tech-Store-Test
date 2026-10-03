"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "نظرة عامة" },
  { href: "/dashboard/categories", label: "الأقسام" },
  { href: "/dashboard/products", label: "المنتجات" },
  { href: "/dashboard/reviews", label: "التقييمات" },
  { href: "/dashboard/settings", label: "إعدادات الموقع" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/dashboard/login") {
    return <div className="flex min-h-screen items-center justify-center px-4">{children}</div>;
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-card)] md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-s md:p-4">
        <div className="flex items-center justify-between px-4 pt-3 md:mb-6 md:px-2 md:pt-0">
          <p className="text-lg font-bold">لوحة التحكم</p>
          <form action={signOut} className="md:hidden">
            <button type="submit" className="min-h-11 cursor-pointer text-sm text-[var(--color-destructive)]">
              خروج
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-2 md:block md:space-y-1 md:overflow-visible md:p-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block shrink-0 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(link.href) ? "bg-[var(--color-primary)] text-white" : "hover:bg-[var(--color-muted)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-6 hidden px-2 md:block">
          <button type="submit" className="cursor-pointer text-sm text-[var(--color-destructive)]">
            تسجيل الخروج
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
