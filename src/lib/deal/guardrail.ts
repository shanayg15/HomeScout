/**
 * Output guardrail for the "good deal?" read — the structural enforcement of the
 * "information, not advice" hard line. Used both by the deal service (to reject
 * + replace bad LLM output) and by the eval `noAbsoluteVerdict` assertion, so
 * the banned list has a single source of truth.
 */

/** Absolute-verdict phrasings the deal read must never contain. */
export const BANNED_VERDICT_PATTERNS: RegExp[] = [
  /\byou should buy\b/i,
  /\byou should not buy\b/i,
  /\bdon'?t buy\b/i,
  /\bdefinitely buy\b/i,
  /\bguaranteed\b/i,
  /\bthis is a great deal\b/i,
  /\bthis is a bad deal\b/i,
  /\bsafe investment\b/i,
  /\bcan'?t go wrong\b/i,
  /\bcan'?t lose\b/i,
];

/** Returns the first banned pattern found, or null. */
export function bannedVerdict(text: string): RegExp | null {
  return BANNED_VERDICT_PATTERNS.find((re) => re.test(text)) ?? null;
}

export interface Figure {
  value: number;
  kind: "pct" | "usd";
}

/** Extract dollar amounts and percentages mentioned in prose. */
export function extractFigures(text: string): Figure[] {
  const out: Figure[] = [];
  for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s*%/g)) {
    out.push({ value: Number(m[1]), kind: "pct" });
  }
  for (const m of text.matchAll(/\$\s?([\d,]+(?:\.\d+)?)\s*([kKmM])?/g)) {
    let n = Number(m[1].replace(/,/g, ""));
    const suffix = m[2]?.toLowerCase();
    if (suffix === "k") n *= 1_000;
    else if (suffix === "m") n *= 1_000_000;
    out.push({ value: n, kind: "usd" });
  }
  return out;
}

export interface FigureCandidates {
  usd: number[];
  pct: number[];
}

/**
 * Figures in `text` that DON'T correspond to any number the dossier provided —
 * the "no invented numbers" check. Empty array ⇒ everything is grounded.
 */
export function ungroundedFigures(
  text: string,
  candidates: FigureCandidates,
): Figure[] {
  return extractFigures(text).filter((f) => {
    const pool = f.kind === "pct" ? candidates.pct : candidates.usd;
    const tol = f.kind === "pct" ? 0.6 : Math.max(2_000, f.value * 0.02);
    return !pool.some((c) => Math.abs(c - f.value) <= tol);
  });
}
