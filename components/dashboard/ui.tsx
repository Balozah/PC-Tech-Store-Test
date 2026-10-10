import Link from "next/link";
import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

// Lucide-style 24px stroke icons, inlined so the dashboard ships no icon library.
const ICONS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  box: "M21 8 12 3 3 8m18 0v8l-9 5m9-13-9 5m0 8-9-5V8m9 13v-8M3 8l9 5",
  folder: "M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.2-1.3L14.4 3h-4l-.4 2.4a7.5 7.5 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a7.5 7.5 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z",
  plus: "M12 5v14M5 12h14",
  search: "m21 21-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z",
  back: "M9 6l6 6-6 6",
  chevron: "M15 6l-6 6 6 6",
  external: "M14 4h6v6M10 14 20 4M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  logout: "M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  check: "M5 12.5 10 17 19 7",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5a1.5 1.5 0 1 0 0-.01",
  alert: "M12 9v4m0 4h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  pencil: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  x: "M6 6l12 12M18 6 6 18",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5 shrink-0", className)}
      {...props}
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

export const inputClass =
  "w-full border border-[var(--color-border)] bg-[var(--color-background)] px-3.5 py-2.5 text-base text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/70 transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 sm:text-sm";

export const labelClass = "mb-1.5 block text-sm font-medium text-[var(--color-foreground)]";
export const hintClass = "mt-1.5 text-xs leading-relaxed text-[var(--color-muted-foreground)]";

const buttonBase =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-4 text-sm font-semibold transition-[background-color,border-color,opacity,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50";

export const buttonClass = {
  primary: cn(buttonBase, "bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-primary)]"),
  secondary: cn(
    buttonBase,
    "border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:border-[var(--color-ink)]"
  ),
  ghost: cn(buttonBase, "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"),
  danger: cn(buttonBase, "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/20"),
  success: cn(buttonBase, "bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90"),
};

export function Card({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(" border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "danger" | "warning" | "info"; children: ReactNode }) {
  const tones = {
    neutral: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
    success: "bg-[var(--color-success)]/12 text-[var(--color-success)]",
    danger: "bg-[var(--color-destructive)]/12 text-[var(--color-destructive)]",
    warning: "bg-[#b45309]/12 text-[#92400e]",
    info: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "رجوع",
  actions,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="-ms-2 mb-2 inline-flex min-h-11 items-center gap-1 px-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
        >
          <Icon name="back" className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: IconName; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-[var(--color-muted-foreground)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-[var(--color-muted-foreground)]">{description}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 border border-[var(--color-border)] bg-[var(--color-muted)] transition-colors peer-checked:border-[var(--color-ink)] peer-checked:bg-[var(--color-ink)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)]/50 after:absolute after:top-px after:start-px after:h-5 after:w-5 after:bg-white after:shadow after:transition-transform peer-checked:after:-translate-x-5 ltr:peer-checked:after:translate-x-5"
      />
    </label>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)} />;
}

export function formatAdminPrice(usd: number | null, syp: number | null, onRequest: boolean) {
  if (onRequest) return "السعر عند الطلب";
  const parts: string[] = [];
  if (usd != null) parts.push(`$${usd.toLocaleString("en")}`);
  if (syp != null) parts.push(`${syp.toLocaleString("en")} ل.س`);
  return parts.join(" · ") || "بدون سعر";
}
