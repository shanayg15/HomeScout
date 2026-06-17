import type { EvalCase } from "../types";
import { noFabrication, skip } from "../assertions";

/**
 * Known zoning codes. The plain-English explanation is an LLM job (M6), so the
 * correctness SHOULD is skipped until then. The MUST that runs now: if the
 * plain-English is unavailable, it must be null (no fabrication).
 */
function zoningAssertions(dossier: Parameters<EvalCase["assertions"]>[0]) {
  return [
    noFabrication("zoning.plainEnglish noFabrication", dossier.zoning.plainEnglish),
    skip(
      "plainEnglishMentionsCorrectBroadUse",
      "should",
      "pending LLM zoning translation (M6)",
    ),
  ];
}

export const zoning: EvalCase[] = [
  {
    id: "zoning-residential-r1",
    description: "Known residential zoning code (R-1)",
    input: { address: "742 Evergreen Terrace, Springfield, IL 62704" },
    groundTruth: {
      notes: "R-1 → single-family residential; M6 explanation must not overstate uses.",
    },
    pendingRealData: true,
    assertions: zoningAssertions,
  },
  {
    id: "zoning-commercial-c2",
    description: "Known commercial zoning code (C-2)",
    input: { address: "55 Commerce Blvd, Dallas, TX 75201" },
    groundTruth: {
      notes: "C-2 → general commercial; M6 explanation must say commercial, not residential.",
    },
    pendingRealData: true,
    assertions: zoningAssertions,
  },
];
