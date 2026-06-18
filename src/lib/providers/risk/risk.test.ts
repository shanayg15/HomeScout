import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  FemaResponseSchema,
  WalkScoreResponseSchema,
  CensusAcsResponseSchema,
} from "@/lib/schemas/risk";
import { mapFemaFlood } from "./femaFlood";
import { mapWalkScore } from "./walkscore";
import { mapCensusAcs } from "./censusAcs";

function fx(name: string): unknown {
  return JSON.parse(readFileSync(`evals/fixtures/risk/${name}`, "utf8"));
}

const FETCHED = "2026-06-18T00:00:00.000Z";

describe("mapFemaFlood", () => {
  it("maps an AE zone as SFHA + insurance likely", () => {
    const r = mapFemaFlood(FemaResponseSchema.parse(fx("fema-ae.json")), FETCHED);
    expect(r.zone.value).toBe("AE");
    expect(r.inSFHA.value).toBe(true);
    expect(r.insuranceLikelyRequired.value).toBe(true);
    expect(r.panelId).toBe("12086C");
  });

  it("maps an X zone as not SFHA", () => {
    const r = mapFemaFlood(FemaResponseSchema.parse(fx("fema-x.json")), FETCHED);
    expect(r.zone.value).toBe("X");
    expect(r.inSFHA.value).toBe(false);
    expect(r.insuranceLikelyRequired.value).toBe(false);
  });

  it("notes shaded-X (0.2% / 500-yr) as moderate, still not SFHA", () => {
    const r = mapFemaFlood(
      FemaResponseSchema.parse(fx("fema-x-shaded.json")),
      FETCHED,
    );
    expect(r.inSFHA.value).toBe(false);
    expect(r.zone.note).toMatch(/moderate/i);
  });

  it("treats empty features as no determination - never fabricates", () => {
    const r = mapFemaFlood(
      FemaResponseSchema.parse(fx("fema-empty.json")),
      FETCHED,
    );
    expect(r.zone.availability).toBe("unavailable");
    expect(r.zone.value).toBeNull();
    expect(r.inSFHA.value).toBeNull();
  });
});

describe("mapWalkScore", () => {
  it("maps walk/transit/bike on status 1", () => {
    const r = mapWalkScore(
      WalkScoreResponseSchema.parse(fx("walkscore-ok.json")),
      FETCHED,
    );
    expect(r.walkScore.value).toBe(88);
    expect(r.transitScore.value).toBe(62);
    expect(r.bikeScore.value).toBe(70);
  });

  it("marks everything unavailable on status 2 (calculating)", () => {
    const r = mapWalkScore(
      WalkScoreResponseSchema.parse(fx("walkscore-calculating.json")),
      FETCHED,
    );
    expect(r.walkScore.availability).toBe("unavailable");
    expect(r.walkScore.value).toBeNull();
  });

  it("keeps walk but marks null transit/bike unavailable", () => {
    const r = mapWalkScore(
      WalkScoreResponseSchema.parse(fx("walkscore-no-transit.json")),
      FETCHED,
    );
    expect(r.walkScore.value).toBe(45);
    expect(r.transitScore.value).toBeNull();
    expect(r.bikeScore.value).toBeNull();
  });
});

describe("mapCensusAcs", () => {
  it("maps income + owner-occupied rate", () => {
    const r = mapCensusAcs(
      CensusAcsResponseSchema.parse(fx("census-acs.json")),
      "2024",
    );
    expect(r.medianHouseholdIncome.value).toBe(85000);
    expect(r.ownerOccupiedRate.value).toBeCloseTo(410 / 612, 3);
  });

  it("treats negative jam sentinels and zero tenure as unavailable (no garbage)", () => {
    const r = mapCensusAcs(
      CensusAcsResponseSchema.parse(fx("census-acs-missing.json")),
      "2024",
    );
    expect(r.medianHouseholdIncome.value).toBeNull();
    expect(r.medianHouseholdIncome.availability).toBe("unavailable");
    expect(r.ownerOccupiedRate.value).toBeNull();
  });
});
