/**
 * Display formatters. ALL number/date/currency rendering goes through here so
 * "Not available" is handled in exactly one place and never leaks a zero or a
 * guessed value. `null`/`undefined` always render as the placeholder, never 0.
 */
import type { MoneyRange } from "@/lib/types/dossier";

/** The single placeholder used everywhere a value is unknown. */
export const NOT_AVAILABLE = "-";

export function formatCurrency(
  value: number | null | undefined,
  opts: { maximumFractionDigits?: number } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NOT_AVAILABLE;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts.maximumFractionDigits ?? 0,
  }).format(value);
}

export function formatNumber(
  value: number | null | undefined,
  opts: { maximumFractionDigits?: number } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NOT_AVAILABLE;
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: opts.maximumFractionDigits ?? 0,
  }).format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return NOT_AVAILABLE;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NOT_AVAILABLE;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Format a money range as "$X (range $low–$high)". If the point is missing but
 * a range exists, show just the range. If nothing is known, the placeholder.
 */
export function formatRange(range: MoneyRange | null | undefined): string {
  if (!range) return NOT_AVAILABLE;
  const { point, low, high } = range;
  const hasRange = low !== null && high !== null;
  if (point !== null) {
    return hasRange
      ? `${formatCurrency(point)} (range ${formatCurrency(low)}–${formatCurrency(high)})`
      : formatCurrency(point);
  }
  if (hasRange) {
    return `${formatCurrency(low)}–${formatCurrency(high)}`;
  }
  return NOT_AVAILABLE;
}

/**
 * Format a percentage. By default the input is treated as already a percent
 * (e.g. 6.9 → "6.9%"). Pass `fromFraction` for 0..1 ratios (e.g. 0.62 → "62%").
 */
export function formatPercent(
  value: number | null | undefined,
  opts: { fromFraction?: boolean; maximumFractionDigits?: number } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NOT_AVAILABLE;
  }
  const pct = opts.fromFraction ? value * 100 : value;
  return `${formatNumber(pct, {
    maximumFractionDigits: opts.maximumFractionDigits ?? 1,
  })}%`;
}
