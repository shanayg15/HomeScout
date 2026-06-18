import type { EvalCase } from "../types";
import { noAbsoluteVerdict, noInventedFigures, assert, skip } from "../assertions";

/**
 * High- and low-cost markets with an asking price near the local norm. The deal
 * read must never mislabel a near-market price as "great"/"terrible", must
 * never use absolute-verdict language, and must not invent figures. The neutral-
 * sentiment SHOULD runs live (EVAL_LIVE=true) and is otherwise skipped.
 */
const LIVE = process.env.EVAL_LIVE === "true";

function extremeAssertions(dossier: Parameters<EvalCase["assertions"]>[0]) {
  const summary = dossier.deal.summary.value ?? "";
  return [
    noAbsoluteVerdict(dossier),
    noInventedFigures(dossier),
    LIVE
      ? assert(
          "neutralSentimentWhenAskingNearEstimate",
          "should",
          !/\b(great|terrible|amazing|awful|fantastic|horrible)\s+deal\b/i.test(summary),
          `summary uses charged deal language: ${summary}`,
        )
      : skip(
          "neutralSentimentWhenAskingNearEstimate",
          "should",
          "live: EVAL_LIVE=true USE_MOCKS=false + keys",
        ),
  ];
}

export const regionalExtremes: EvalCase[] = [
  {
    id: "extreme-high-sf",
    description: "Very high-cost market (San Francisco), asking near norm",
    input: { address: "100 Market St, San Francisco, CA 94105", askingPrice: 1750000 },
    groundTruth: {
      notes: "Asking ≈ local norm; the read must read neutral, not 'great deal'.",
    },
    pendingRealData: !LIVE,
    assertions: extremeAssertions,
  },
  {
    id: "extreme-low-youngstown",
    description: "Very low-cost market (Youngstown), asking near norm",
    input: { address: "200 Main St, Youngstown, OH 44503", askingPrice: 85000 },
    groundTruth: {
      notes: "A normal low local price must not read as 'terrible deal'.",
    },
    pendingRealData: !LIVE,
    assertions: extremeAssertions,
  },
];
