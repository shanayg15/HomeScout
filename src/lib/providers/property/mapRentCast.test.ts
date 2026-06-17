import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  RentCastPropertiesResponseSchema,
  RentCastValueAvmSchema,
  RentCastRentAvmSchema,
} from "@/lib/schemas/rentcast";
import { mapRentCastProperty, mapRentCastAvm } from "./mapRentCast";
import type { PropertyIdentity } from "@/lib/types/dossier";

// Fixtures are read relative to the repo root (vitest cwd).
function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(`evals/fixtures/rentcast/${name}`, "utf8"),
  );
}

const geoIdentity: PropertyIdentity = {
  formattedAddress: "5500 Grand Lake Dr, San Antonio, TX 78244",
  addressLine1: "5500 Grand Lake Dr",
  city: "San Antonio",
  state: "TX",
  zip: "78244",
  county: "Bexar County",
  latitude: 29.476011,
  longitude: -98.351454,
};

const FETCHED = "2026-06-18T00:00:00.000Z";

describe("mapRentCastProperty", () => {
  it("maps a well-covered record (latest tax year, owner.names, prior sales)", () => {
    const raw = RentCastPropertiesResponseSchema.parse(
      fixture("property-well-covered.json"),
    )[0];
    const m = mapRentCastProperty(raw, geoIdentity, FETCHED);

    expect(m.found).toBe(true);
    expect(m.structure.beds.value).toBe(3);
    expect(m.structure.squareFootage.availability).toBe("available");
    expect(m.ownership.ownerName.value).toBe("R. Villarreal");
    expect(m.ownership.lastSalePrice.value).toBe(270000);
    // Latest tax year wins (2024), not an earlier one.
    expect(m.tax.assessedValue.value).toBe(216513);
    expect(m.tax.taxAmountAnnual.value).toBe(4065);
    expect(m.tax.taxYear.value).toBe(2024);
    // Prior sales sorted most-recent-first.
    expect(m.ownership.priorSales.value?.[0].price).toBe(270000);
    expect(m.ownership.priorSales.value?.length).toBe(2);
    expect(m.zoning.code.value).toBe("RH");
    // Plain-English is an LLM job — must be unavailable + null (no fabrication).
    expect(m.zoning.plainEnglish.availability).toBe("unavailable");
    expect(m.zoning.plainEnglish.value).toBeNull();
    expect(m.identity.apn).toBe("05076-103-0500");
  });

  it("maps a partial record without fabricating missing fields", () => {
    const raw = RentCastPropertiesResponseSchema.parse(
      fixture("property-partial.json"),
    )[0];
    const m = mapRentCastProperty(raw, geoIdentity, FETCHED);

    expect(m.found).toBe(true);
    expect(m.structure.beds.value).toBe(2);
    // Missing fields → unavailable + null, never 0 or a guess.
    expect(m.structure.lotSizeSqft.availability).toBe("unavailable");
    expect(m.structure.lotSizeSqft.value).toBeNull();
    expect(m.ownership.ownerName.value).toBeNull();
    expect(m.ownership.lastSalePrice.value).toBeNull();
    expect(m.tax.assessedValue.value).toBeNull();
    expect(m.zoning.code.value).toBeNull();
    expect(m.ownership.priorSales.availability).toBe("unavailable");
  });

  it("maps a not-found (empty array) to all-unavailable sections", () => {
    const arr = RentCastPropertiesResponseSchema.parse(
      fixture("property-not-found.json"),
    );
    const m = mapRentCastProperty(arr[0], geoIdentity, FETCHED);

    expect(m.found).toBe(false);
    expect(m.structure.beds.value).toBeNull();
    expect(m.structure.beds.availability).toBe("unavailable");
    expect(m.ownership.ownerName.value).toBeNull();
    expect(m.tax.assessedValue.value).toBeNull();
    // Identity still carries the geocoded location.
    expect(m.identity.latitude).toBe(29.476011);
  });
});

describe("mapRentCastAvm", () => {
  it("maps value (high confidence) + rent (medium) + comps with correlation→similarity", () => {
    const value = RentCastValueAvmSchema.parse(fixture("avm-value.json"));
    const rent = RentCastRentAvmSchema.parse(fixture("avm-rent.json"));
    const v = mapRentCastAvm(value, rent, FETCHED);

    expect(v.valueEstimate.value?.point).toBe(271000);
    expect(v.valueEstimate.value?.low).toBe(254000);
    expect(v.valueEstimate.value?.high).toBe(288000);
    // 6 tight comps → high confidence.
    expect(v.valueEstimate.confidence).toBe("high");
    // 4 comps → medium confidence.
    expect(v.rentEstimate.value?.point).toBe(1650);
    expect(v.rentEstimate.confidence).toBe("medium");

    expect(v.saleComps.value?.length).toBe(6);
    expect(v.saleComps.value?.[0].kind).toBe("sale");
    expect(v.saleComps.value?.[0].similarity).toBe(0.985); // from `correlation`
    expect(v.rentalComps.value?.length).toBe(4);
    expect(v.rentalComps.value?.[0].kind).toBe("rental");
    // Rent comp's value comes from `price`.
    expect(v.rentalComps.value?.[0].price).toBe(1627);
  });

  it("maps absent AVM data to unavailable estimates (no fabrication)", () => {
    const v = mapRentCastAvm(null, null, FETCHED);
    expect(v.valueEstimate.availability).toBe("unavailable");
    expect(v.valueEstimate.value).toBeNull();
    expect(v.rentEstimate.availability).toBe("unavailable");
    expect(v.rentEstimate.value).toBeNull();
    expect(v.saleComps.value).toBeNull();
    expect(v.rentalComps.value).toBeNull();
  });
});
