import type { EvalCase } from "../types";
import {
  confidenceAtMost,
  noFabricationAnywhere,
  hasCoverageWarning,
} from "../assertions";

/**
 * The #1 failure-mode guard: sparse/rural input must yield low confidence, no
 * fabricated values, and a coverage warning. Uses the `__thin__` mock sentinel
 * (Option A); M3 turns these on for real obscure addresses too.
 */
function thinAssertions(dossier: Parameters<EvalCase["assertions"]>[0]) {
  return [
    confidenceAtMost(dossier, "low"),
    noFabricationAnywhere(dossier),
    hasCoverageWarning(dossier),
  ];
}

export const thinCoverage: EvalCase[] = [
  {
    id: "thin-rural-mt",
    description: "Rural Montana parcel with no RentCast/county coverage",
    input: { address: "__thin__ 14 Rural Route 2, Sparseville, MT 59000" },
    groundTruth: {
      expectedConfidenceAtMost: "low",
      notes: "Sentinel forces sparse data; mirrors a real uncovered area in M3.",
    },
    assertions: thinAssertions,
  },
  {
    id: "thin-remote-nv",
    description: "Remote Nevada parcel, niche/unlisted",
    input: { address: "__thin__ Parcel 7, Remote County, NV 89000" },
    groundTruth: {
      expectedConfidenceAtMost: "low",
      notes: "Sentinel forces sparse data; mirrors a real uncovered area in M3.",
    },
    assertions: thinAssertions,
  },
];
