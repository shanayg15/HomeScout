/**
 * Pure mappers from validated raw RentCast responses into our `Sourced<>`
 * dossier fields. No network, no side-effects — unit-tested against fixtures.
 *
 * The governing rule: a missing/null source field becomes an `unavailable`
 * Sourced with a null value and a note. We NEVER substitute a 0 or a guess.
 */
import type {
  Confidence,
  OwnershipInfo,
  PropertyIdentity,
  PropertyStructure,
  Sourced,
  TaxInfo,
  Valuation,
  Comp,
  Zoning,
  MoneyRange,
} from "@/lib/types/dossier";
import type {
  RentCastProperty,
  RentCastComp,
  RentCastValueAvm,
  RentCastRentAvm,
} from "@/lib/schemas/rentcast";

export interface MappedProperty {
  identity: PropertyIdentity;
  structure: PropertyStructure;
  ownership: OwnershipInfo;
  tax: TaxInfo;
  zoning: Zoning;
  /** Whether a real property record was found. */
  found: boolean;
}

function available<T>(
  value: T,
  confidence: Confidence,
  asOf?: string,
): Sourced<T> {
  return {
    value,
    source: "rentcast",
    confidence,
    availability: "available",
    asOf,
  };
}

function unavailable<T>(note: string): Sourced<T> {
  return {
    value: null,
    source: "rentcast",
    confidence: "low",
    availability: "unavailable",
    note,
  };
}

/** A direct record field: available (high confidence) or unavailable. */
function recordField<T>(
  value: T | null | undefined,
  note: string,
  asOf?: string,
): Sourced<T> {
  return value === null || value === undefined
    ? unavailable<T>(note)
    : available<T>(value, "high", asOf);
}

/** Latest entry from a year/date-keyed object (RentCast's tax/history shape). */
function latestKeyed<V>(
  rec: Record<string, V> | null | undefined,
): { key: string; entry: V } | null {
  if (!rec) return null;
  const keys = Object.keys(rec);
  if (keys.length === 0) return null;
  const key = keys.sort().at(-1) as string; // years "2024" and ISO dates both sort lexically
  return { key, entry: rec[key] };
}

/**
 * AVM confidence heuristic (documented thresholds):
 *  - high:   >= 6 comps AND range spread (high-low)/point <= 0.15
 *  - medium: >= 3 comps AND spread <= 0.35
 *  - low:    everything else (few comps, wide range, or no point estimate)
 */
function avmConfidence(
  point: number | null,
  low: number | null,
  high: number | null,
  compCount: number,
): Confidence {
  if (point === null || point <= 0) return "low";
  const haveRange = low !== null && high !== null && high >= low;
  const spread = haveRange ? (high - low) / point : Infinity;
  if (compCount >= 6 && spread <= 0.15) return "high";
  if (compCount >= 3 && spread <= 0.35) return "medium";
  return "low";
}

export function mapRentCastProperty(
  raw: RentCastProperty | undefined,
  geoIdentity: PropertyIdentity,
  fetchedAt: string,
): MappedProperty {
  const found = raw !== undefined;
  const noRecord = "No property record found for this address.";

  const identity: PropertyIdentity = {
    ...geoIdentity,
    formattedAddress:
      geoIdentity.formattedAddress || raw?.formattedAddress || "",
    county: geoIdentity.county ?? raw?.county ?? undefined,
    apn: raw?.assessorID ?? geoIdentity.apn,
    propertyType: raw?.propertyType ?? geoIdentity.propertyType,
    latitude: geoIdentity.latitude ?? raw?.latitude ?? null,
    longitude: geoIdentity.longitude ?? raw?.longitude ?? null,
  };

  const structure: PropertyStructure = {
    beds: recordField(raw?.bedrooms, noRecord, fetchedAt),
    baths: recordField(raw?.bathrooms, noRecord, fetchedAt),
    squareFootage: recordField(raw?.squareFootage, noRecord, fetchedAt),
    lotSizeSqft: recordField(raw?.lotSize, noRecord, fetchedAt),
    yearBuilt: recordField(raw?.yearBuilt, noRecord, fetchedAt),
  };

  // Ownership: owner.names[0]; prior sales from the date-keyed `history`.
  const ownerName = raw?.owner?.names?.[0] ?? null;
  const priorSales =
    raw?.history &&
    Object.entries(raw.history)
      .map(([date, h]) => ({ date: h.date || date, price: h.price ?? null }))
      .filter((s): s is { date: string; price: number } => s.price !== null)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

  const ownership: OwnershipInfo = {
    ownerName: recordField(ownerName, "No owner of record in public data.", fetchedAt),
    lastSalePrice: recordField(
      raw?.lastSalePrice,
      "No recorded sale price for this parcel.",
      fetchedAt,
    ),
    lastSaleDate: recordField(
      raw?.lastSaleDate,
      "No recorded sale date for this parcel.",
      fetchedAt,
    ),
    priorSales:
      priorSales && priorSales.length > 0
        ? available(priorSales, "high", fetchedAt)
        : unavailable("No prior sale history available."),
  };

  // Tax: latest entry from the year-keyed objects.
  const assessment = latestKeyed(raw?.taxAssessments);
  const propertyTax = latestKeyed(raw?.propertyTaxes);
  const taxYear =
    assessment?.entry.year ??
    propertyTax?.entry.year ??
    (assessment ? Number(assessment.key) : propertyTax ? Number(propertyTax.key) : null);

  const tax: TaxInfo = {
    assessedValue: recordField(
      assessment?.entry.value ?? null,
      "No assessed value on file.",
      fetchedAt,
    ),
    taxAmountAnnual: recordField(
      propertyTax?.entry.total ?? null,
      "No property-tax amount on file.",
      fetchedAt,
    ),
    taxYear: recordField(
      Number.isFinite(taxYear) ? (taxYear as number) : null,
      "No tax year on file.",
      fetchedAt,
    ),
  };

  const zoning: Zoning = {
    code: recordField(raw?.zoning, "No zoning code from this source.", fetchedAt),
    // Plain-English explanation is an LLM job (M6).
    plainEnglish: {
      value: null,
      source: "llm",
      confidence: "low",
      availability: "unavailable",
      note: "Plain-English zoning explanation added in a later step (M6).",
    },
    // RentCast does not provide permits.
    recentPermits: unavailable("No permit data available for this area."),
  };

  return { identity, structure, ownership, tax, zoning, found };
}

function mapComp(
  raw: RentCastComp,
  index: number,
  kind: "sale" | "rental",
): Comp {
  return {
    id: raw.id ?? `${kind}-${index}`,
    formattedAddress: raw.formattedAddress ?? "",
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    price: raw.price ?? null,
    beds: raw.bedrooms ?? undefined,
    baths: raw.bathrooms ?? undefined,
    squareFootage: raw.squareFootage ?? undefined,
    distanceMiles: raw.distance ?? undefined,
    similarity: raw.correlation ?? undefined, // RentCast's `correlation`
    kind,
  };
}

export function mapRentCastAvm(
  value: RentCastValueAvm | null,
  rent: RentCastRentAvm | null,
  fetchedAt: string,
): Valuation {
  const saleComps = (value?.comparables ?? []).map((c, i) => mapComp(c, i, "sale"));
  const rentalComps = (rent?.comparables ?? []).map((c, i) =>
    mapComp(c, i, "rental"),
  );

  const valuePoint = value?.price ?? null;
  const valueLow = value?.priceRangeLow ?? null;
  const valueHigh = value?.priceRangeHigh ?? null;
  const rentPoint = rent?.rent ?? null;
  const rentLow = rent?.rentRangeLow ?? null;
  const rentHigh = rent?.rentRangeHigh ?? null;

  const valueRange: MoneyRange = {
    point: valuePoint,
    low: valueLow,
    high: valueHigh,
    currency: "USD",
  };
  const rentRange: MoneyRange = {
    point: rentPoint,
    low: rentLow,
    high: rentHigh,
    currency: "USD",
  };

  const valueEstimate: Sourced<MoneyRange> =
    valuePoint === null && valueLow === null && valueHigh === null
      ? unavailable("Not enough comparable sales to estimate a value.")
      : available(
          valueRange,
          avmConfidence(valuePoint, valueLow, valueHigh, saleComps.length),
          fetchedAt,
        );

  const rentEstimate: Sourced<MoneyRange> =
    rentPoint === null && rentLow === null && rentHigh === null
      ? unavailable("Not enough comparable rentals to estimate rent.")
      : available(
          rentRange,
          avmConfidence(rentPoint, rentLow, rentHigh, rentalComps.length),
          fetchedAt,
        );

  return {
    valueEstimate,
    rentEstimate,
    saleComps:
      saleComps.length > 0
        ? available(saleComps, "high", fetchedAt)
        : unavailable("No comparable sales found nearby."),
    rentalComps:
      rentalComps.length > 0
        ? available(rentalComps, "high", fetchedAt)
        : unavailable("No comparable rentals found nearby."),
  };
}
