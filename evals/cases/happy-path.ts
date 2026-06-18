import type { EvalCase } from "../types";
import {
  noFabricationAnywhere,
  coherentRange,
  noAbsoluteVerdict,
  noInventedFigures,
  isPopulated,
  assert,
  skip,
} from "../assertions";

function happyAssertions(
  dossier: Parameters<EvalCase["assertions"]>[0],
  c: EvalCase,
) {
  const v = dossier.valuation.valueEstimate.value;
  const r = dossier.valuation.rentEstimate.value;

  const results = [
    // MUST — data-safety properties that hold against mock and real data alike.
    noFabricationAnywhere(dossier),
    coherentRange("valueEstimate coherentRange", {
      low: v?.low ?? null,
      point: v?.point ?? null,
      high: v?.high ?? null,
    }),
    coherentRange("rentEstimate coherentRange", {
      low: r?.low ?? null,
      point: r?.point ?? null,
      high: r?.high ?? null,
    }),
    noAbsoluteVerdict(dossier),
    noInventedFigures(dossier),

    // SHOULD — quality targets met by the full mock now.
    assert(
      "identity populated",
      "should",
      dossier.identity.formattedAddress.trim().length > 0,
    ),
    isPopulated("ownership.lastSalePrice populated", dossier.ownership.lastSalePrice),
    isPopulated("valuation.valueEstimate populated", dossier.valuation.valueEstimate),
    isPopulated("valuation.rentEstimate populated", dossier.valuation.rentEstimate),
  ];

  // SHOULD, skipped until real data: value range contains the known sale price.
  if (c.groundTruth?.knownSalePrice != null) {
    results.push(
      skip(
        "valueRangeContainsKnownSale",
        "should",
        "pending real RentCast value estimate (M3)",
      ),
    );
  }

  return results;
}

export const happyPath: EvalCase[] = [
  {
    id: "happy-dc-rowhouse",
    description: "Ordinary DC rowhouse in a normal market",
    input: { address: "1500 Swann St NW, Washington, DC 20009" },
    groundTruth: {
      knownSalePrice: 1150000,
      notes:
        "Illustrative ground truth — replace with a verified recent sale in M3.",
    },
    assertions: happyAssertions,
  },
  {
    id: "happy-austin-sfh",
    description: "Single-family home in Austin, TX",
    input: { address: "2502 Bowman Ave, Austin, TX 78703" },
    groundTruth: {
      knownSalePrice: 1450000,
      notes:
        "Illustrative ground truth — replace with a verified recent sale in M3.",
    },
    assertions: happyAssertions,
  },
  {
    id: "happy-columbus-sfh",
    description: "Single-family home in Columbus, OH (mid-cost market)",
    input: { address: "850 E Whittier St, Columbus, OH 43206" },
    groundTruth: {
      knownSalePrice: 365000,
      notes:
        "Illustrative ground truth — replace with a verified recent sale in M3.",
    },
    assertions: happyAssertions,
  },
];
