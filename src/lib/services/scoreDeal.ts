import type { DealRead, Valuation } from "@/lib/types/dossier";

/**
 * Produce the grounded "is this a good deal?" read: deterministic yield math +
 * an LLM plain-English explanation with explicit confidence and the exact data
 * points used. Never an absolute verdict, never a fabricated number.
 * Stub — real implementation arrives in Milestone 6.
 */
export async function scoreDeal(_input: {
  valuation: Valuation;
  askingPrice?: number;
}): Promise<DealRead> {
  throw new Error("Not implemented — added in Milestone 6 (scoreDeal).");
}
