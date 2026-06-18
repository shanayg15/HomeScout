/**
 * Plain-English zoning explanation (LLM). Conservative: if no code is present
 * or the model is unsure, we say so rather than overstating permitted uses.
 * Missing `ANTHROPIC_API_KEY` → unavailable. Never fabricates.
 */
import type { Confidence, Sourced } from "@/lib/types/dossier";
import { llmConfigured, llmJson, LLM_MODELS } from "@/lib/llm/anthropic";
import {
  ZoningExplanationSchema,
  type ZoningExplanation,
} from "@/lib/schemas/llm";

const ZONING_SYSTEM = `You explain US municipal zoning codes in plain language for a general consumer.

Rules:
- Be accurate and CONSERVATIVE. If you are not confident what a specific local code means, say so rather than guessing — set generalCategory to "unknown" and confidence to "low".
- Never OVERSTATE what is permitted. Zoning specifics vary by municipality.
- Give a 1-2 sentence plain-English description of the general category, mention typical permitted uses only at a general level, and always include a caveat that the user should confirm with the municipality.

Return JSON: { "explanation": string, "generalCategory": "residential"|"commercial"|"industrial"|"mixed_use"|"agricultural"|"other"|"unknown", "confidence": "high"|"medium"|"low", "caveat": string }.`;

/** Pure mapper: validated LLM output → a Sourced plain-English string. */
export function mapZoningExplanation(data: ZoningExplanation): Sourced<string> {
  // Downgrade confidence if the model itself is unsure.
  const confidence: Confidence =
    data.generalCategory === "unknown" ? "low" : data.confidence;
  const caveat = data.caveat?.trim()
    ? data.caveat.trim()
    : "Zoning is local — confirm specifics with the municipality.";
  const text = `${data.explanation.trim()} ${caveat}`.trim();
  return {
    value: text,
    source: "llm",
    confidence,
    availability: "available",
    note: "Plain-English explanation by AI — confirm with the municipality.",
  };
}

export async function explainZoning(
  code: string | null,
  location: { city?: string; state?: string },
): Promise<Sourced<string>> {
  if (!code) {
    return {
      value: null,
      source: "llm",
      confidence: "low",
      availability: "unavailable",
      note: "No zoning code available for this property.",
    };
  }
  if (!llmConfigured()) {
    return {
      value: null,
      source: "llm",
      confidence: "low",
      availability: "unavailable",
      note: "AI zoning explanation not configured (set ANTHROPIC_API_KEY).",
    };
  }

  const res = await llmJson({
    system: ZONING_SYSTEM,
    user: `Zoning code: "${code}". Location: ${[location.city, location.state].filter(Boolean).join(", ") || "US"}. Explain what this zoning code generally means.`,
    schema: ZoningExplanationSchema,
    model: LLM_MODELS.zoning,
    maxTokens: 400,
  });

  if (!res.ok) {
    return {
      value: null,
      source: "llm",
      confidence: "low",
      availability: "unavailable",
      note: "Plain-English zoning explanation is temporarily unavailable.",
    };
  }
  return mapZoningExplanation(res.data);
}
