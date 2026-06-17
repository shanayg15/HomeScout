/**
 * Mock property provider — the reference shape all real providers must
 * reproduce. Returns a fully-populated, realistic `Dossier` for a generic US
 * single-family home, with `isMock: true` and every `Sourced` field tagged
 * `source: "mock"`. The only unavailable field is the plain-English zoning,
 * which is an LLM job (M6) — proving the "unavailable ⇒ null" path renders.
 *
 * NOTE: M2 extends this with sentinel inputs (`__thin__`, `__null__`) to
 * exercise the thin-coverage / no-fabrication eval assertions. M1 keeps it to a
 * single full dossier.
 */
import type {
  Comp,
  Dossier,
  PropertyIdentity,
  Sourced,
} from "@/lib/types/dossier";
import { addressToSlug } from "@/lib/utils/id";

const FRESH = "2025-11-15";

function mockAvailable<T>(
  value: T,
  extra: Partial<Sourced<T>> = {},
): Sourced<T> {
  return {
    value,
    source: "mock",
    confidence: "medium",
    availability: "available",
    asOf: FRESH,
    ...extra,
  };
}

function mockUnavailable<T>(note: string): Sourced<T> {
  return {
    value: null,
    source: "mock",
    confidence: "low",
    availability: "unavailable",
    note,
  };
}

/** Best-effort parse of "street, city, ST zip" — falls back to placeholders. */
function parseIdentity(rawAddress: string): PropertyIdentity {
  const raw = rawAddress.trim();
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const addressLine1 = parts[0] || raw || "123 Mock Street";
  let city = "Springfield";
  let state = "IL";
  let zip = "62704";

  const stateZip = /\b([A-Za-z]{2})\s*(\d{5})(?:-\d{4})?\b/;
  if (parts.length >= 3) {
    city = parts[1] || city;
    const m = parts[2].match(stateZip);
    if (m) {
      state = m[1].toUpperCase();
      zip = m[2];
    }
  } else if (parts.length === 2) {
    const m = parts[1].match(/^(.*?)\s+([A-Za-z]{2})\s*(\d{5})(?:-\d{4})?$/);
    if (m) {
      city = m[1].trim() || city;
      state = m[2].toUpperCase();
      zip = m[3];
    } else {
      city = parts[1];
    }
  }

  return {
    formattedAddress: raw || `${addressLine1}, ${city}, ${state} ${zip}`,
    addressLine1,
    city,
    state,
    zip,
    county: "Sangamon County",
    apn: "14-25-300-012",
    latitude: 39.7817,
    longitude: -89.6501,
    propertyType: "Single Family",
  };
}

function mockComps(baseLat: number, baseLng: number): {
  sale: Comp[];
  rental: Comp[];
} {
  const sale: Comp[] = [
    {
      id: "mock-sale-1",
      formattedAddress: "118 Mock Oak Ln, Springfield, IL 62704",
      latitude: baseLat + 0.004,
      longitude: baseLng + 0.003,
      price: 442000,
      beds: 3,
      baths: 2,
      squareFootage: 1820,
      distanceMiles: 0.3,
      similarity: 0.92,
      kind: "sale",
    },
    {
      id: "mock-sale-2",
      formattedAddress: "204 Mock Maple Ct, Springfield, IL 62704",
      latitude: baseLat - 0.005,
      longitude: baseLng + 0.006,
      price: 468000,
      beds: 4,
      baths: 2.5,
      squareFootage: 2010,
      distanceMiles: 0.6,
      similarity: 0.85,
      kind: "sale",
    },
    {
      id: "mock-sale-3",
      formattedAddress: "57 Mock Birch Rd, Springfield, IL 62704",
      latitude: baseLat + 0.008,
      longitude: baseLng - 0.004,
      price: 431000,
      beds: 3,
      baths: 2,
      squareFootage: 1755,
      distanceMiles: 0.9,
      similarity: 0.81,
      kind: "sale",
    },
  ];

  const rental: Comp[] = [
    {
      id: "mock-rent-1",
      formattedAddress: "12 Mock Cedar Ave, Springfield, IL 62704",
      latitude: baseLat - 0.003,
      longitude: baseLng - 0.005,
      price: 2550,
      beds: 3,
      baths: 2,
      squareFootage: 1790,
      distanceMiles: 0.4,
      similarity: 0.9,
      kind: "rental",
    },
    {
      id: "mock-rent-2",
      formattedAddress: "340 Mock Pine St, Springfield, IL 62704",
      latitude: baseLat + 0.006,
      longitude: baseLng + 0.002,
      price: 2700,
      beds: 4,
      baths: 2,
      squareFootage: 1980,
      distanceMiles: 0.7,
      similarity: 0.83,
      kind: "rental",
    },
  ];

  return { sale, rental };
}

/** Build a complete, clearly-mock dossier for the given raw address. */
export function getMockDossier(rawAddress: string): Dossier {
  const identity = parseIdentity(rawAddress);
  const { sale, rental } = mockComps(
    identity.latitude ?? 39.7817,
    identity.longitude ?? -89.6501,
  );

  return {
    id: addressToSlug(identity.formattedAddress) || "mock-property",
    generatedAt: new Date().toISOString(),
    isMock: true,
    identity,
    structure: {
      beds: mockAvailable(3),
      baths: mockAvailable(2),
      squareFootage: mockAvailable(1860),
      lotSizeSqft: mockAvailable(7200),
      yearBuilt: mockAvailable(1998),
    },
    ownership: {
      ownerName: mockAvailable("Jordan & Alex Sample"),
      lastSalePrice: mockAvailable(389000),
      lastSaleDate: mockAvailable("2019-06-14"),
      priorSales: mockAvailable([
        { date: "2011-04-02", price: 268000 },
        { date: "2003-08-19", price: 184500 },
      ]),
    },
    tax: {
      assessedValue: mockAvailable(372000),
      taxAmountAnnual: mockAvailable(6840),
      taxYear: mockAvailable(2024),
    },
    valuation: {
      valueEstimate: mockAvailable(
        { point: 450000, low: 420000, high: 482000, currency: "USD" as const },
        { confidence: "medium" },
      ),
      rentEstimate: mockAvailable(
        { point: 2600, low: 2400, high: 2800, currency: "USD" as const },
        { confidence: "medium" },
      ),
      saleComps: mockAvailable(sale),
      rentalComps: mockAvailable(rental),
    },
    zoning: {
      code: mockAvailable("R-1"),
      plainEnglish: mockUnavailable(
        "Plain-English zoning explanation added in a later step (M6).",
      ),
      recentPermits: mockAvailable([
        {
          date: "2023-05-10",
          description: "Reroof — asphalt shingles",
          status: "Final",
        },
        {
          date: "2021-09-22",
          description: "HVAC replacement",
          status: "Final",
        },
      ]),
    },
    flood: {
      zone: mockAvailable("X"),
      inSFHA: mockAvailable(false),
      insuranceLikelyRequired: mockAvailable(false),
      panelId: "17167C0123D",
    },
    neighborhood: {
      walkScore: mockAvailable(45),
      transitScore: mockAvailable(30),
      bikeScore: mockAvailable(48),
      medianHouseholdIncome: mockAvailable(72400),
      ownerOccupiedRate: mockAvailable(0.62),
      crimeContext: mockAvailable(
        "Area-level context only, not a property safety rating. This is mock data.",
      ),
    },
    deal: {
      summary: mockAvailable(
        "MOCK READ — based on placeholder figures only. The estimated rent of ~$2,600/mo against a ~$450k value implies a gross yield near 6.9%, which is typical for a single-family home in a normal market. Verify everything with a licensed professional. This is development mock data, not a real analysis.",
        { confidence: "low" },
      ),
      // Stored as a percentage value (6.9 = 6.9%), not a fraction.
      // M3 computes this as ((monthlyRent * 12) / value) * 100.
      grossYieldPct: mockAvailable(6.9, { source: "computed" }),
      dataPointsUsed: [
        "valuation.rentEstimate (mock)",
        "valuation.valueEstimate (mock)",
      ],
      confidence: "medium",
    },
    warnings: [
      "This is mock data for development — not real property information.",
    ],
  };
}
