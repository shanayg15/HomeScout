import type { EvalCase } from "../types";
import { noAbsoluteVerdict, skip } from "../assertions";

/**
 * High- and low-cost markets with an asking price near the local norm. The deal
 * read must not mislabel a near-market price as "great"/"terrible". The neutral-
 * sentiment SHOULD is skipped until the real deal read (M6); the no-verdict MUST
 * runs now.
 */
function extremeAssertions(dossier: Parameters<EvalCase["assertions"]>[0]) {
  return [
    noAbsoluteVerdict(dossier),
    skip(
      "neutralSentimentWhenAskingNearEstimate",
      "should",
      "pending real deal read (M6)",
    ),
  ];
}

export const regionalExtremes: EvalCase[] = [
  {
    id: "extreme-high-sf",
    description: "Very high-cost market (San Francisco), asking near norm",
    input: { address: "100 Market St, San Francisco, CA 94105", askingPrice: 1750000 },
    groundTruth: {
      notes:
        "Asking ≈ local norm; deal read (M6) must read neutral, not 'great deal'.",
    },
    pendingRealData: true,
    assertions: extremeAssertions,
  },
  {
    id: "extreme-low-youngstown",
    description: "Very low-cost market (Youngstown), asking near norm",
    input: { address: "200 Main St, Youngstown, OH 44503", askingPrice: 85000 },
    groundTruth: {
      notes:
        "A normal low local price must not read as 'terrible deal' in M6.",
    },
    pendingRealData: true,
    assertions: extremeAssertions,
  },
];
