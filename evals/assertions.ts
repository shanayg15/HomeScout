import type { Dossier, Sourced, Confidence } from "@/lib/types/dossier";
import type { AssertionResult, Tier } from "./types";

export function assert(
  name: string,
  tier: Tier,
  passed: boolean,
  detail?: string,
): AssertionResult {
  return { name, tier, passed, detail };
}

/** A wired-but-skipped assertion (pending real providers/LLM). */
export function skip(
  name: string,
  tier: Tier,
  detail = "pending real providers (M3/M5/M6)",
): AssertionResult {
  return { name, tier, passed: true, skipped: true, detail };
}

// ---------------------------------------------------------------------------
// Sourced traversal
// ---------------------------------------------------------------------------

/** Heuristic: an object shaped like a `Sourced<T>`. */
function isSourced(v: unknown): v is Sourced<unknown> {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    "value" in o &&
    "source" in o &&
    "confidence" in o &&
    "availability" in o
  );
}

/**
 * Collect every `Sourced` in the dossier. Does NOT descend into a Sourced's
 * `value` (that's data, e.g. a MoneyRange or Comp[], never another Sourced).
 */
function collectSourced(
  node: unknown,
  acc: Array<{ path: string; sourced: Sourced<unknown> }>,
  path = "",
): void {
  if (node === null || typeof node !== "object") return;
  if (isSourced(node)) {
    acc.push({ path, sourced: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectSourced(item, acc, `${path}[${i}]`));
    return;
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    collectSourced(v, acc, path ? `${path}.${k}` : k);
  }
}

// ---------------------------------------------------------------------------
// Data-safety (MUST)
// ---------------------------------------------------------------------------

/** A Sourced field marked unavailable MUST have value === null. No fabrication. */
export function noFabrication(
  name: string,
  field: Sourced<unknown>,
): AssertionResult {
  const bad = field.availability === "unavailable" && field.value !== null;
  return assert(
    name,
    "must",
    !bad,
    bad
      ? `Field is "unavailable" but value is ${JSON.stringify(field.value)} (must be null).`
      : undefined,
  );
}

/** Scan the WHOLE dossier: every unavailable Sourced has a null value. */
export function noFabricationAnywhere(dossier: Dossier): AssertionResult {
  const all: Array<{ path: string; sourced: Sourced<unknown> }> = [];
  collectSourced(dossier, all);
  const offenders = all.filter(
    ({ sourced }) =>
      sourced.availability === "unavailable" && sourced.value !== null,
  );
  return assert(
    "noFabricationAnywhere",
    "must",
    offenders.length === 0,
    offenders.length
      ? `Fabricated values at: ${offenders.map((o) => o.path).join(", ")}`
      : `scanned ${all.length} Sourced fields, none fabricated`,
  );
}

const CONFIDENCE_RANK: Record<Confidence, number> = {
  unknown: 0,
  low: 1,
  medium: 2,
  high: 3,
};

/** The deal read confidence is at most the given level. */
export function confidenceAtMost(
  dossier: Dossier,
  max: "high" | "medium" | "low",
): AssertionResult {
  const actual = dossier.deal.confidence;
  const ok = CONFIDENCE_RANK[actual] <= CONFIDENCE_RANK[max];
  return assert(
    `confidenceAtMost(${max})`,
    "must",
    ok,
    ok ? undefined : `deal.confidence is "${actual}", expected at most "${max}"`,
  );
}

const BANNED_VERDICTS: RegExp[] = [
  /\byou should buy\b/i,
  /\byou should not buy\b/i,
  /\bdon'?t buy\b/i,
  /\bdefinitely buy\b/i,
  /\bguaranteed\b/i,
  /\bthis is a great deal\b/i,
  /\bthis is a bad deal\b/i,
  /\bsafe investment\b/i,
  /\bcan'?t go wrong\b/i,
];

/** The deal read summary must NOT contain absolute-verdict language. */
export function noAbsoluteVerdict(dossier: Dossier): AssertionResult {
  const summary = dossier.deal.summary.value;
  if (!summary) {
    return assert("noAbsoluteVerdict", "must", true, "no summary present");
  }
  const hit = BANNED_VERDICTS.find((re) => re.test(summary));
  return assert(
    "noAbsoluteVerdict",
    "must",
    !hit,
    hit ? `summary contains banned verdict phrase: ${hit}` : undefined,
  );
}

/**
 * Value/rent estimates, when present, must be a coherent range:
 * low <= point <= high, all > 0. Absent (all null) passes.
 */
export function coherentRange(
  name: string,
  range: { low: number | null; point: number | null; high: number | null },
): AssertionResult {
  const { low, point, high } = range;
  if (low === null && point === null && high === null) {
    return assert(name, "must", true, "not present");
  }
  const present = [low, point, high].filter((v): v is number => v !== null);
  if (present.some((v) => !(v > 0))) {
    return assert(name, "must", false, "a present bound is <= 0");
  }
  if (low !== null && point !== null && low > point) {
    return assert(name, "must", false, `low ${low} > point ${point}`);
  }
  if (point !== null && high !== null && point > high) {
    return assert(name, "must", false, `point ${point} > high ${high}`);
  }
  if (low !== null && high !== null && low > high) {
    return assert(name, "must", false, `low ${low} > high ${high}`);
  }
  return assert(name, "must", true);
}

/** A Sourced field is unavailable with a null value AND carries a note. */
export function unavailableWithNote(
  name: string,
  field: Sourced<unknown>,
): AssertionResult {
  const ok =
    field.availability === "unavailable" &&
    field.value === null &&
    typeof field.note === "string" &&
    field.note.length > 0;
  return assert(
    name,
    "must",
    ok,
    ok
      ? undefined
      : `expected unavailable + null + note; got availability="${field.availability}", value=${JSON.stringify(field.value)}, note=${JSON.stringify(field.note)}`,
  );
}

/** The dossier warnings include a limited-coverage warning. */
export function hasCoverageWarning(dossier: Dossier): AssertionResult {
  const ok = dossier.warnings.some((w) =>
    /limited data|coverage|not enough/i.test(w),
  );
  return assert(
    "hasCoverageWarning",
    "must",
    ok,
    ok ? undefined : `warnings: ${JSON.stringify(dossier.warnings)}`,
  );
}

// ---------------------------------------------------------------------------
// Quality (SHOULD)
// ---------------------------------------------------------------------------

/** The value range contains the known sale price. */
export function rangeContains(
  name: string,
  range: { low: number | null; high: number | null },
  truth: number,
): AssertionResult {
  const ok =
    range.low !== null && range.high !== null && truth >= range.low && truth <= range.high;
  return assert(
    name,
    "should",
    ok,
    ok
      ? undefined
      : `truth ${truth} not in [${range.low}, ${range.high}]`,
  );
}

/** A field is populated (available + non-null). */
export function isPopulated(
  name: string,
  field: Sourced<unknown>,
): AssertionResult {
  const ok = field.availability !== "unavailable" && field.value !== null;
  return assert(name, "should", ok, ok ? undefined : "field is empty/unavailable");
}

/** Flood zone matches known truth (case-insensitive). */
export function floodMatches(
  dossier: Dossier,
  knownZone: string,
): AssertionResult {
  const actual = dossier.flood.zone.value;
  const ok =
    typeof actual === "string" &&
    actual.toUpperCase() === knownZone.toUpperCase();
  return assert(
    "floodMatches",
    "should",
    ok,
    ok ? undefined : `flood zone "${actual}" != known "${knownZone}"`,
  );
}
