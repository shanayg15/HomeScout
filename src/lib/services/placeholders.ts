/**
 * Placeholder + empty section builders for the real lookup path.
 *
 * - `placeholder*` = sections owned by a LATER milestone (flood/neighborhood →
 *   M5), rendered as unavailable so the schema validates and the UI shows
 *   "added in M5" gracefully.
 * - `empty*` = sections we tried to fill from RentCast but a hard provider error
 *   prevented (e.g. rate limit). Rendered unavailable — never fabricated.
 */
import type {
  DataSource,
  FloodRisk,
  Neighborhood,
  OwnershipInfo,
  PropertyStructure,
  Sourced,
  TaxInfo,
  Valuation,
  Zoning,
} from "@/lib/types/dossier";

function un<T>(source: DataSource, note: string): Sourced<T> {
  return { value: null, source, confidence: "low", availability: "unavailable", note };
}

// ---- later-milestone placeholders ----

export function placeholderFlood(): FloodRisk {
  const note = "Flood risk (FEMA) added in a later step (M5).";
  return {
    zone: un("fema", note),
    inSFHA: un("fema", note),
    insuranceLikelyRequired: un("fema", note),
  };
}

export function placeholderNeighborhood(): Neighborhood {
  const m5 = "Added in a later step (M5).";
  return {
    walkScore: un("walkscore", m5),
    transitScore: un("walkscore", m5),
    bikeScore: un("walkscore", m5),
    medianHouseholdIncome: un("census", m5),
    ownerOccupiedRate: un("census", m5),
    crimeContext: un("fbi_crime", m5),
  };
}

// ---- hard-error fallbacks (provider threw) ----

const ERR = "Property data temporarily unavailable.";

export function emptyStructure(): PropertyStructure {
  return {
    beds: un("rentcast", ERR),
    baths: un("rentcast", ERR),
    squareFootage: un("rentcast", ERR),
    lotSizeSqft: un("rentcast", ERR),
    yearBuilt: un("rentcast", ERR),
  };
}

export function emptyOwnership(): OwnershipInfo {
  return {
    ownerName: un("rentcast", ERR),
    lastSalePrice: un("rentcast", ERR),
    lastSaleDate: un("rentcast", ERR),
    priorSales: un("rentcast", ERR),
  };
}

export function emptyTax(): TaxInfo {
  return {
    assessedValue: un("rentcast", ERR),
    taxAmountAnnual: un("rentcast", ERR),
    taxYear: un("rentcast", ERR),
  };
}

export function emptyZoning(): Zoning {
  return {
    code: un("rentcast", ERR),
    plainEnglish: un("llm", "Plain-English zoning explanation added in a later step (M6)."),
    recentPermits: un("rentcast", "No permit data available for this area."),
  };
}

export function emptyValuation(): Valuation {
  return {
    valueEstimate: un("rentcast", ERR),
    rentEstimate: un("rentcast", ERR),
    saleComps: un("rentcast", ERR),
    rentalComps: un("rentcast", ERR),
  };
}
