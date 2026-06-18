/** Zod schemas validating the LLM's JSON output before we trust it. */
import { z } from "zod";

export const ZoningExplanationSchema = z.object({
  explanation: z.string(),
  generalCategory: z.enum([
    "residential",
    "commercial",
    "industrial",
    "mixed_use",
    "agricultural",
    "other",
    "unknown",
  ]),
  confidence: z.enum(["high", "medium", "low"]),
  caveat: z.string(),
});

export type ZoningExplanation = z.infer<typeof ZoningExplanationSchema>;

export const DealReadLlmSchema = z.object({
  summary: z.string(),
  dataPointsUsed: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
  confidenceReason: z.string(),
});

export type DealReadLlm = z.infer<typeof DealReadLlmSchema>;
