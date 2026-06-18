/**
 * Homescout — the core data contract.
 *
 * Every later milestone fills real providers behind these shapes, so this file
 * is the single most important contract in the codebase. The governing design
 * principle (the "info, not advice" hard line) is structural: every datum is a
 * {@link Sourced} value that carries its source, confidence, and availability.
 * When a value isn't known, `value` is `null`, `availability` is `"unavailable"`,
 * and a human `note` explains why — we never fabricate a placeholder number.
 */

// ---- provenance primitives ----

/** Where a single datum came from. */
export type DataSource =
  | "rentcast"
  | "census"
  | "fema"
  | "walkscore"
  | "fbi_crime"
  | "openstreetmap"
  | "llm"
  | "computed"
  | "mock";

/** How confident we are in a datum or judgment. Never implies a guarantee. */
export type Confidence = "high" | "medium" | "low" | "unknown";

/** Whether a datum was actually found. */
export type Availability = "available" | "partial" | "unavailable";

/**
 * A wrapper for any single datum so the UI can always show where it came from,
 * how confident we are, and whether it was actually found.
 *
 * INVARIANT: when `availability` is `"unavailable"`, `value` MUST be `null`.
 * Never a fabricated placeholder. This is enforced by the Zod schema and by the
 * eval harness (`noFabricationAnywhere`).
 */
export interface Sourced<T> {
  value: T | null;
  source: DataSource;
  confidence: Confidence;
  availability: Availability;
  /** ISO date string of the data's freshness, if known. */
  asOf?: string;
  /** Short human note, e.g. "no county coverage". */
  note?: string;
}

// ---- a money range (used for value & rent estimates) ----

export interface MoneyRange {
  /** Central estimate. */
  point: number | null;
  low: number | null;
  high: number | null;
  currency: "USD";
}

// ---- subsections ----

export interface PropertyIdentity {
  formattedAddress: string;
  addressLine1: string;
  city: string;
  /** 2-letter state code. */
  state: string;
  zip: string;
  county?: string;
  /** Assessor parcel number. */
  apn?: string;
  latitude: number | null;
  longitude: number | null;
  /** e.g. "Single Family". */
  propertyType?: string;
}

export interface PropertyStructure {
  beds: Sourced<number>;
  baths: Sourced<number>;
  squareFootage: Sourced<number>;
  lotSizeSqft: Sourced<number>;
  yearBuilt: Sourced<number>;
}

export interface OwnershipInfo {
  ownerName: Sourced<string>;
  lastSalePrice: Sourced<number>;
  /** ISO date. */
  lastSaleDate: Sourced<string>;
  priorSales: Sourced<Array<{ date: string; price: number }>>;
}

export interface TaxInfo {
  assessedValue: Sourced<number>;
  taxAmountAnnual: Sourced<number>;
  taxYear: Sourced<number>;
}

export interface Comp {
  id: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  /** Sale price OR monthly rent depending on `kind`. */
  price: number | null;
  beds?: number;
  baths?: number;
  squareFootage?: number;
  distanceMiles?: number;
  /** 0..1 correlation/closeness. */
  similarity?: number;
  kind: "sale" | "rental";
}

export interface Valuation {
  valueEstimate: Sourced<MoneyRange>;
  rentEstimate: Sourced<MoneyRange>;
  saleComps: Sourced<Comp[]>;
  rentalComps: Sourced<Comp[]>;
}

export interface Zoning {
  /** Raw zoning code, e.g. "R-1". */
  code: Sourced<string>;
  /** Plain-English meaning — filled by the LLM in M6; unavailable until then. */
  plainEnglish: Sourced<string>;
  recentPermits: Sourced<
    Array<{ date: string; description: string; status?: string }>
  >;
}

export interface FloodRisk {
  /** e.g. "AE", "X". */
  zone: Sourced<string>;
  /** Special Flood Hazard Area. */
  inSFHA: Sourced<boolean>;
  insuranceLikelyRequired: Sourced<boolean>;
  panelId?: string;
}

export interface Neighborhood {
  walkScore: Sourced<number>;
  transitScore: Sourced<number>;
  bikeScore: Sourced<number>;
  medianHouseholdIncome: Sourced<number>;
  /** 0..1. */
  ownerOccupiedRate: Sourced<number>;
  /** Descriptive, area-level context — NEVER a safety verdict. */
  crimeContext: Sourced<string>;
}

export interface DealRead {
  /** Plain-English read (LLM, M6). */
  summary: Sourced<string>;
  /** Computed: annual rent / value (or asking price). */
  grossYieldPct: Sourced<number>;
  /** Explicit list of what fed the read. */
  dataPointsUsed: string[];
  /** Overall confidence of the read. */
  confidence: Confidence;
  /** Why the read has that confidence (M6). */
  confidenceReason?: string;
}

// ---- the top-level object everything returns ----

export interface Dossier {
  /** Stable slug from the normalized address. */
  id: string;
  /** ISO timestamp. */
  generatedAt: string;
  /** TRUE whenever any section is mock data. */
  isMock: boolean;
  identity: PropertyIdentity;
  structure: PropertyStructure;
  ownership: OwnershipInfo;
  tax: TaxInfo;
  valuation: Valuation;
  zoning: Zoning;
  flood: FloodRisk;
  neighborhood: Neighborhood;
  deal: DealRead;
  /** e.g. "Limited data coverage in this area". */
  warnings: string[];
}
