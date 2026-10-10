import { SearchIcon } from "@/components/icons";
import type { Locale } from "@/i18n/routing";

// Plain GET form: works before (or without) JavaScript, which matters on slow
// connections. The search page reads `q` from the URL.
export function SearchForm({
  locale,
  placeholder,
  label,
  defaultValue,
  autoFocus,
  size = "md",
  className,
}: {
  locale: Locale;
  placeholder: string;
  label: string;
  defaultValue?: string;
  autoFocus?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const lg = size === "lg";
  return (
    <form
      action={`/${locale}/search`}
      method="get"
      role="search"
      className={`items-stretch border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-ink)] ${lg ? "flex h-14" : "h-11"} ${className ?? ""}`}
    >
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        maxLength={80}
        enterKeyHint="search"
        className={`min-w-0 flex-1 bg-transparent px-4 text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-soft)] ${lg ? "text-lg" : "text-sm"}`}
      />
      <button
        type="submit"
        aria-label={label}
        className={`grid shrink-0 cursor-pointer place-items-center bg-[var(--color-ink)] text-[var(--color-paper)] transition-colors hover:bg-[var(--color-primary)] ${lg ? "w-14" : "w-11"}`}
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
}
