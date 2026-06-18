/**
 * The "is this a good deal?" read — compute-in-code, explain-with-LLM.
 *
 * Deterministic signals (yield, asking-vs-estimate, confidence) are computed
 * first; the LLM only writes a hedged plain-English summary over those numbers.
 * Every LLM summary passes a code-side guardrail: if it contains an absolute
 * verdict OR a figure not present in the dossier, it is REPLACED by a safe
 * template. Final confidence is never higher than the data-derived confidence.
 */
import type {
  Confidence,
  DealRead,
  FloodRisk,
  Neighborhood,
  Sourced,
  Valuation,
} from "@/lib/types/dossier";
import { llmConfigured, llmJson, LLM_MODELS } from "@/lib/llm/anthropic";
import { DealReadLlmSchema, type DealReadLlm } from "@/lib/schemas/llm";
import {
  computeDealSignals,
  figureCandidates,
  buildSafeDealSummary,
  buildDataPointsUsed,
  type DealSignals,
} from "@/lib/deal/signals";
import { bannedVerdict, ungroundedFigures } from "@/lib/deal/guardrail";

const RANK: Record<Confidence, number> = { unknown: 0, low: 1, medium: 2, high: 3 };
function lowerConfidence(a: Confidence, b: Confidence): Confidence {
  return RANK[a] <= RANK[b] ? a : b;
}

const DEAL_SYSTEM = `You write a brief, neutral, plain-English summary of how a property's price, value, rent, and risk compare, for INFORMATIONAL PURPOSES ONLY.

Hard rules:
- You are NOT an appraiser or financial advisor. You must NOT tell the user whether to buy, sell, rent, or invest.
- Use ONLY the numbers provided in the input. NEVER invent, estimate, or round to new figures. If a number is missing, acknowledge the gap.
- Always express uncertainty appropriate to the provided confidence level. Never use absolute or guarantee language.
- BANNED phrasings: "you should buy", "you should not buy", "don't buy", "definitely buy", "guaranteed", "great deal"/"bad deal" as absolutes, "safe investment", "can't go wrong", "can't lose".
- Prefer hedged framings like "the asking price appears modestly above the estimated value range" or "the rent-to-price ratio is around X%, which is [context]".
- End with a reminder to verify with a licensed professional.

Return JSON: { "summary": string (2-4 sentences), "dataPointsUsed": string[], "confidence": "high"|"medium"|"low", "confidenceReason": string }.`;

function dealUserPrompt(s: DealSignals): string {
  return [
    "Property deal signals (use only these numbers):",
    `- Estimated value: ${s.valuePoint ?? "unavailable"} (range ${s.valueLow ?? "?"}–${s.valueHigh ?? "?"})`,
    `- Estimated monthly rent: ${s.rentPoint ?? "unavailable"}`,
    `- Gross rental yield: ${s.grossYieldPct ?? "unavailable"}%`,
    `- Asking price: ${s.askingPrice ?? "not provided"}`,
    s.askingVsEstimatePct != null
      ? `- Asking vs estimate: ${s.askingVsEstimatePct}% (${s.askingWithinRange ? "within" : "outside"} the value range)`
      : "- Asking vs estimate: n/a",
    `- Comparable sales used: ${s.compCount}`,
    `- In a FEMA Special Flood Hazard Area: ${s.inSFHA === null ? "unknown" : s.inSFHA}`,
    `- Computed confidence: ${s.confidence} (${s.confidenceReason})`,
  ].join("\n");
}

function grossYieldSourced(s: DealSignals): Sourced<number> {
  return s.grossYieldPct !== null
    ? {
        value: s.grossYieldPct,
        source: "computed",
        confidence: "medium",
        availability: "available",
      }
    : {
        value: null,
        source: "computed",
        confidence: "low",
        availability: "unavailable",
        note: "Need both a value and a rent estimate to compute gross yield.",
      };
}

/**
 * Pure finalizer: turn the (possibly failed) LLM result + signals into a
 * guardrailed DealRead. Exported for unit tests (no network).
 */
export function finalizeDeal(
  llmResult: { ok: true; data: DealReadLlm } | { ok: false; error: string } | null,
  signals: DealSignals,
): DealRead {
  const grossYieldPct = grossYieldSourced(signals);
  const fallbackDataPoints = buildDataPointsUsed(signals);
  const candidates = figureCandidates(signals);

  let summaryText: string;
  let modelConfidence: Confidence = signals.confidence;
  let reason = signals.confidenceReason;
  let dataPointsUsed = fallbackDataPoints;

  const clean =
    llmResult?.ok === true &&
    !bannedVerdict(llmResult.data.summary) &&
    ungroundedFigures(llmResult.data.summary, candidates).length === 0;

  if (llmResult?.ok && clean) {
    summaryText = llmResult.data.summary;
    modelConfidence = llmResult.data.confidence;
    reason = llmResult.data.confidenceReason || signals.confidenceReason;
    dataPointsUsed = llmResult.data.dataPointsUsed?.length
      ? llmResult.data.dataPointsUsed
      : fallbackDataPoints;
  } else {
    // Guardrail trip or LLM failure → safe, grounded, verdict-free template.
    summaryText = buildSafeDealSummary(signals);
  }

  const finalConfidence = lowerConfidence(signals.confidence, modelConfidence);

  return {
    summary: {
      value: summaryText,
      source: "llm",
      confidence: finalConfidence,
      availability: "available",
      note: "Informational only — not appraisal or financial advice.",
    },
    grossYieldPct,
    dataPointsUsed,
    confidence: finalConfidence,
    confidenceReason: reason,
  };
}

export async function scoreDeal(input: {
  valuation: Valuation;
  flood: FloodRisk;
  neighborhood: Neighborhood;
  askingPrice?: number | null;
}): Promise<DealRead> {
  const signals = computeDealSignals(input);

  if (!llmConfigured()) {
    // No key → narrative unavailable, but the deterministic math still shows.
    return {
      summary: {
        value: null,
        source: "llm",
        confidence: "low",
        availability: "unavailable",
        note: "AI deal read not configured (set ANTHROPIC_API_KEY). The computed gross yield still shows.",
      },
      grossYieldPct: grossYieldSourced(signals),
      dataPointsUsed: buildDataPointsUsed(signals),
      confidence: signals.confidence,
      confidenceReason: signals.confidenceReason,
    };
  }

  const res = await llmJson({
    system: DEAL_SYSTEM,
    user: dealUserPrompt(signals),
    schema: DealReadLlmSchema,
    model: LLM_MODELS.deal,
    maxTokens: 700,
  });

  return finalizeDeal(res, signals);
}
