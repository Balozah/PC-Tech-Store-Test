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

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-s border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="mb-6 px-2 text-lg font-bold">Tech RT</p>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-[var(--color-primary)] text-white"
                  : "hover:bg-[var(--color-muted)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-6 px-2">
          <button type="submit" className="cursor-pointer text-sm text-[var(--color-destructive)]">
            تسجيل الخروج
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
