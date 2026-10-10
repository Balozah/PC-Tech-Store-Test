// Product specifications (approved add-on): an ordered list of label/value
// rows stored in products.specs (jsonb). Pure helpers, safe on client and server.

export type Spec = { label_ar: string; label_en: string | null; value: string };

export const SPECS_MAX_ROWS = 30;
const LABEL_MAX = 60;
const VALUE_MAX = 120;

/** Keeps only well-formed rows; tolerates a missing column (undefined) or bad data. */
export function sanitizeSpecs(input: unknown): Spec[] {
  if (!Array.isArray(input)) return [];
  const rows: Spec[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const label_ar = typeof r.label_ar === "string" ? r.label_ar.trim().slice(0, LABEL_MAX) : "";
    const label_en = typeof r.label_en === "string" ? r.label_en.trim().slice(0, LABEL_MAX) : "";
    const value = typeof r.value === "string" ? r.value.trim().slice(0, VALUE_MAX) : "";
    if (!label_ar || !value) continue;
    rows.push({ label_ar, label_en: label_en || null, value });
    if (rows.length === SPECS_MAX_ROWS) break;
  }
  return rows;
}

/** Rows in the visitor's language (English label falls back to Arabic). */
export function specRows(specs: unknown, locale: string) {
  return sanitizeSpecs(specs).map((s) => ({
    label: locale === "ar" ? s.label_ar : s.label_en ?? s.label_ar,
    value: s.value,
  }));
}
