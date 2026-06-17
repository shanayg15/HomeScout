import type { EvalCase } from "../types";
import { noFabrication, floodMatches, assert, skip } from "../assertions";

/**
 * Flood-zone correctness. The real FEMA lookup arrives in M5, so the
 * zone/SFHA-match SHOULDs are skipped until then. The MUST that runs now: the
 * flood section never fabricates (unavailable ⇒ null).
 */
function floodAssertions(dossier: Parameters<EvalCase["assertions"]>[0], c: EvalCase) {
  const results = [
    noFabrication("flood.zone noFabrication", dossier.flood.zone),
    noFabrication("flood.inSFHA noFabrication", dossier.flood.inSFHA),
  ];
  if (c.groundTruth?.knownFloodZone) {
    results.push(skip("floodMatches", "should", "pending FEMA lookup (M5)"));
  }
  if (c.groundTruth?.knownInSFHA != null) {
    results.push(skip("inSFHAMatches", "should", "pending FEMA lookup (M5)"));
  }
  // Keep references alive so M5 can flip these to live with one edit.
  void floodMatches;
  void assert;
  return results;
}

export const floodRisk: EvalCase[] = [
  {
    id: "flood-sfha-coastal",
    description: "Coastal address in a known Special Flood Hazard Area",
    input: { address: "1 Beach Rd, Galveston, TX 77550" },
    groundTruth: {
      knownFloodZone: "AE",
      knownInSFHA: true,
      notes: "Known SFHA; M5 must surface zone AE and inSFHA=true.",
    },
    pendingRealData: true,
    assertions: floodAssertions,
  },
  {
    id: "flood-low-risk-inland",
    description: "Inland address in a known low-risk (zone X) area",
    input: { address: "742 Evergreen Terrace, Springfield, IL 62704" },
    groundTruth: {
      knownFloodZone: "X",
      knownInSFHA: false,
      notes: "Known low-risk; M5 must surface zone X and inSFHA=false.",
    },
    pendingRealData: true,
    assertions: floodAssertions,
  },
];
