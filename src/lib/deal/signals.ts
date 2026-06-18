/**
 * Deterministic deal signals - computed in code from real dossier numbers only.
 * The LLM later EXPLAINS these; it never invents figures. The safe-template
 * summary is built here too, so a guardrail trip always has a grounded,
 * verdict-free fallback.
 */
import type {
  Confidence,
  FloodRisk,
  Neighborhood,
  Valuation,
} from "@/lib/types/dossier";
import type { FigureCandidates } from "./guardrail";
import { computeGrossYieldPct } from "./scoring";

export interface DealSignals {
  valuePoint: number | null;
  valueLow: number | null;
  valueHigh: number | null;
  rentPoint: number | null;
  /** Percentage (e.g. 6.9 = 6.9%). */
  grossYieldPct: number | null;
  askingPrice: number | null;
  /** % the asking price is above (+) / below (−) the value point. */
  askingVsEstimatePct: number | null;
  askingWithinRange: boolean | null;
  /** (high − low) / point, as a percentage. */
  estimateWidthPct: number | null;
  compCount: number;
  inSFHA: boolean | null;
  lowWalkability: boolean | null;
  confidence: Confidence;
  confidenceReason: string;
}

export function computeDealSignals(input: {
  valuation: Valuation;
  flood: FloodRisk;
  neighborhood: Neighborhood;
  askingPrice?: number | null;
}): DealSignals {
  const v = input.valuation.valueEstimate.value;
  const r = input.valuation.rentEstimate.value;
  const valuePoint = v?.point ?? null;
  const valueLow = v?.low ?? null;
  const valueHigh = v?.high ?? null;
  const rentPoint = r?.point ?? null;
  const askingPrice = input.askingPrice ?? null;

  const basis = askingPrice ?? valuePoint;
  const grossYieldPct = computeGrossYieldPct(basis, rentPoint);

  const compCount = input.valuation.saleComps.value?.length ?? 0;

  const estimateWidthPct =
    valuePoint && valueLow != null && valueHigh != null && valuePoint > 0
      ? Math.round(((valueHigh - valueLow) / valuePoint) * 1000) / 10
      : null;

  const askingVsEstimatePct =
    askingPrice != null && valuePoint && valuePoint > 0
      ? Math.round(((askingPrice - valuePoint) / valuePoint) * 1000) / 10
      : null;

  const askingWithinRange =
    askingPrice != null && valueLow != null && valueHigh != null
      ? askingPrice >= valueLow && askingPrice <= valueHigh
      : null;

  const inSFHA =
    input.flood.inSFHA.availability === "available"
      ? input.flood.inSFHA.value
      : null;

  const walk = input.neighborhood.walkScore.value;
  const lowWalkability = typeof walk === "number" ? walk < 50 : null;

  let confidence: Confidence;
  let confidenceReason: string;
  if (valuePoint === null || rentPoint === null) {
    confidence = "low";
    confidenceReason = "the core value or rent estimate is unavailable";
  } else if (compCount >= 6 && (estimateWidthPct ?? 100) <= 15) {
    confidence = "high";
    confidenceReason = `there are ${compCount} comparable sales and a tight value range`;
  } else if (compCount >= 3 && (estimateWidthPct ?? 100) <= 35) {
    confidence = "medium";
    confidenceReason = `there are ${compCount} comparable sales with a moderate value range`;
  } else {
    confidence = "low";
    confidenceReason =
      compCount < 3 ? "there are few comparable sales" : "the value range is wide";
  }

  return {
    valuePoint,
    valueLow,
    valueHigh,
    rentPoint,
    grossYieldPct,
    askingPrice,
    askingVsEstimatePct,
    askingWithinRange,
    estimateWidthPct,
    compCount,
    inSFHA,
    lowWalkability,
    confidence,
    confidenceReason,
  };
}

/** The set of numbers the dossier supports - used by the no-invented-figures guard. */
export function figureCandidates(s: DealSignals): FigureCandidates {
  const usd = [
    s.valuePoint,
    s.valueLow,
    s.valueHigh,
    s.rentPoint,
    s.askingPrice,
  ].filter((n): n is number => n != null);
  const pct = [
    s.grossYieldPct,
    s.askingVsEstimatePct,
    s.estimateWidthPct,
  ].filter((n): n is number => n != null);
  return { usd, pct };
}

/** A hedged, grounded, verdict-free read built only from the signals. */
export function buildSafeDealSummary(s: DealSignals): string {
  const parts: string[] = [];

  if (s.valuePoint === null || s.rentPoint === null) {
    parts.push(
      "There isn't enough public data to assess this property's value meaningfully.",
    );
  } else {
    if (s.askingPrice != null && s.askingVsEstimatePct != null) {
      const rel = s.askingWithinRange
        ? "within"
        : s.askingVsEstimatePct > 0
          ? `about ${Math.abs(s.askingVsEstimatePct)}% above`
          : `about ${Math.abs(s.askingVsEstimatePct)}% below`;
      parts.push(
        `Based on available public data, the asking price appears ${rel} the estimated value range.`,
      );
    }
    if (s.grossYieldPct != null) {
      parts.push(
        `The estimated gross rental yield is around ${s.grossYieldPct}%.`,
      );
    }
  }

  if (s.inSFHA) {
    parts.push(
      "Note this property is in a FEMA Special Flood Hazard Area, which typically means flood insurance.",
    );
  }
  parts.push(`Confidence is ${s.confidence} because ${s.confidenceReason}.`);
  parts.push(
    "This is informational only - not appraisal or financial advice. Verify with a licensed professional.",
  );
  return parts.join(" ");
}

export function buildDataPointsUsed(s: DealSignals): string[] {
  const dp: string[] = [];
  if (s.valuePoint !== null) dp.push("valuation.valueEstimate");
  if (s.rentPoint !== null) dp.push("valuation.rentEstimate");
  if (s.grossYieldPct !== null) dp.push("deal.grossYieldPct (computed)");
  if (s.askingPrice !== null) dp.push("askingPrice (user-entered)");
  if (s.compCount > 0) dp.push(`${s.compCount} comparable sales`);
  if (s.inSFHA !== null) dp.push("flood.inSFHA");
  return dp;
}
