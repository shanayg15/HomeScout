import type { EvalCase } from "../types";
import { noFabrication, assert, skip } from "../assertions";

/**
 * Known zoning codes. The plain-English explanation is an LLM job; the
 * correctness SHOULD runs live (EVAL_LIVE=true, needs RentCast + Anthropic
 * keys) and is otherwise covered by the `mapZoningExplanation` unit tests. The
 * MUST that always runs: an unavailable explanation is null (no fabrication).
 */
const LIVE = process.env.EVAL_LIVE === "true";

function zoningAssertions(expectedKeyword: string) {
  return (dossier: Parameters<EvalCase["assertions"]>[0]) => {
    const pe = dossier.zoning.plainEnglish;
    return [
      noFabrication("zoning.plainEnglish noFabrication", pe),
      LIVE
        ? assert(
            "plainEnglishMentionsCorrectBroadUse",
            "should",
            pe.availability === "available" &&
              typeof pe.value === "string" &&
              new RegExp(expectedKeyword, "i").test(pe.value),
            `expected "${expectedKeyword}" in: ${pe.value ?? "(unavailable)"}`,
          )
        : skip(
            "plainEnglishMentionsCorrectBroadUse",
            "should",
            "live: EVAL_LIVE=true + RentCast & Anthropic keys; also covered by mapZoningExplanation unit tests",
          ),
    ];
  };
}

export const zoning: EvalCase[] = [
  {
    id: "zoning-residential-r1",
    description: "Known residential zoning code (R-1)",
    input: { address: "742 Evergreen Terrace, Springfield, IL 62704" },
    groundTruth: {
      notes: "R-1 → single-family residential; explanation must not overstate uses.",
    },
    pendingRealData: !LIVE,
    assertions: zoningAssertions("residential"),
  },
  {
    id: "zoning-commercial-c2",
    description: "Known commercial zoning code (C-2)",
    input: { address: "55 Commerce Blvd, Dallas, TX 75201" },
    groundTruth: {
      notes: "C-2 → general commercial; explanation must say commercial, not residential.",
    },
    pendingRealData: !LIVE,
    assertions: zoningAssertions("commercial"),
  },
];
