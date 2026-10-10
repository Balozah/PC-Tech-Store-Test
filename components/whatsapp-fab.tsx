"use client";

import { usePathname } from "@/i18n/navigation";
import { WhatsAppIcon } from "@/components/icons";

// Floating chat shortcut. Hidden on product pages, where the sticky order bar
// already carries the WhatsApp action, and on search (keyboard covers it).
export function WhatsAppFab({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/products/") || pathname.startsWith("/search")) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="enter fixed bottom-4 end-4 z-30 grid size-14 place-items-center bg-[var(--color-whatsapp)] text-[var(--color-ink)] shadow-[0_8px_24px_-8px_rgb(14_14_16/0.45)] transition-transform hover:-translate-y-0.5 active:scale-95 sm:bottom-6 sm:end-6"
      style={{ "--enter-delay": "800ms" } as React.CSSProperties}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
