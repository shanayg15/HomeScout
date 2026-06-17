/**
 * Deterministic parts of the deal read. M3 computes only the gross yield; the
 * plain-English "is this a good deal?" narrative is an LLM job (M6) and stays
 * unavailable until then. No absolute verdicts, no invented numbers.
 */
import type { DealRead, Sourced } from "@/lib/types/dossier";

/**
 * Gross yield as a PERCENTAGE number (e.g. 6.9 = 6.9%), not a fraction:
 * ((monthlyRent * 12) / value) * 100. Returns null unless both inputs are valid.
 */
export function computeGrossYieldPct(
  value: number | null,
  monthlyRent: number | null,
): number | null {
  if (value === null || monthlyRent === null) return null;
  if (value <= 0 || monthlyRent <= 0) return null;
  const pct = ((monthlyRent * 12) / value) * 100;
  return Math.round(pct * 10) / 10;
}

/** Build the M3 deal read: real gross yield + an unavailable (M6) narrative. */
export function buildDealRead(
  value: number | null,
  monthlyRent: number | null,
): DealRead {
  const yieldPct = computeGrossYieldPct(value, monthlyRent);
  const dataPointsUsed: string[] = [];

  let grossYieldPct: Sourced<number>;
  if (yieldPct !== null) {
    dataPointsUsed.push("valuation.rentEstimate", "valuation.valueEstimate");
    grossYieldPct = {
      value: yieldPct,
      source: "computed",
      confidence: "medium",
      availability: "available",
    };
  } else {
    grossYieldPct = {
      value: null,
      source: "computed",
      confidence: "low",
      availability: "unavailable",
      note: "Need both a value and a rent estimate to compute gross yield.",
    };
  }

  return {
    summary: {
      value: null,
      source: "llm",
      confidence: "low",
      availability: "unavailable",
      note: "Plain-English deal read added in a later step (M6).",
    },
    grossYieldPct,
    dataPointsUsed,
    confidence: yieldPct !== null ? "medium" : "low",
  };
}
