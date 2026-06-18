import type { EvalCase } from "../types";
import { noFabrication, floodMatches, assert, skip } from "../assertions";

/**
 * Flood-zone correctness (M5 = live). The MUST that always runs: the flood
 * section never fabricates (unavailable ⇒ null). The zone/SFHA SHOULDs run live
 * when EVAL_LIVE=true (FEMA NFHL is keyless), and are otherwise covered
 * deterministically by the `mapFemaFlood` unit tests (`npm test`).
 */
const LIVE = process.env.EVAL_LIVE === "true";

function floodAssertions(
  dossier: Parameters<EvalCase["assertions"]>[0],
  c: EvalCase,
) {
  const results = [
    noFabrication("flood.zone noFabrication", dossier.flood.zone),
    noFabrication("flood.inSFHA noFabrication", dossier.flood.inSFHA),
  ];

  const known = c.groundTruth;
  if (known?.knownFloodZone) {
    results.push(
      LIVE
        ? floodMatches(dossier, known.knownFloodZone)
        : skip(
            "floodMatches",
            "should",
            "live: EVAL_LIVE=true USE_MOCKS=false (FEMA is keyless); also covered by mapFemaFlood unit tests",
          ),
    );
  }
  if (known?.knownInSFHA != null) {
    results.push(
      LIVE
        ? assert(
            "inSFHAMatches",
            "should",
            dossier.flood.inSFHA.value === known.knownInSFHA,
            `inSFHA ${dossier.flood.inSFHA.value} != ${known.knownInSFHA}`,
          )
        : skip("inSFHAMatches", "should", "live: EVAL_LIVE=true USE_MOCKS=false; also covered by unit tests"),
    );
  }
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
      notes: "Known SFHA; FEMA must surface an A/V zone and inSFHA=true.",
    },
    pendingRealData: !LIVE,
    assertions: floodAssertions,
  },
  {
    id: "flood-low-risk-inland",
    description: "Inland address in a known low-risk (zone X) area",
    input: { address: "742 Evergreen Terrace, Springfield, IL 62704" },
    groundTruth: {
      knownFloodZone: "X",
      knownInSFHA: false,
      notes: "Known low-risk; FEMA must surface zone X and inSFHA=false.",
    },
    pendingRealData: !LIVE,
    assertions: floodAssertions,
  },
];
