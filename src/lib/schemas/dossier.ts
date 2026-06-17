/**
 * Zod schemas mirroring `src/lib/types/dossier.ts`.
 *
 * These validate provider output and our assembled dossier in every milestone,
 * so they are strict (reject unexpected shapes) and encode the no-fabrication
 * invariant directly: a `Sourced` marked `"unavailable"` MUST have a null value.
 */
import { z } from "zod";
import type { Dossier } from "@/lib/types/dossier";

// ---- provenance primitives ----

export const DataSourceSchema = z.enum([
  "rentcast",
  "census",
  "fema",
  "walkscore",
  "fbi_crime",
  "openstreetmap",
  "llm",
  "computed",
  "mock",
]);

export const ConfidenceSchema = z.enum(["high", "medium", "low", "unknown"]);

export const AvailabilitySchema = z.enum([
  "available",
  "partial",
  "unavailable",
]);

/**
 * Generic `Sourced<T>` schema factory. Enforces the hard-line invariant:
 * when `availability === "unavailable"`, `value` must be `null` (no fabrication).
 */
export function sourced<T extends z.ZodTypeAny>(value: T) {
  return z
    .strictObject({
      value: value.nullable(),
      source: DataSourceSchema,
      confidence: ConfidenceSchema,
      availability: AvailabilitySchema,
      asOf: z.string().optional(),
      note: z.string().optional(),
    })
    .refine(
      (s) => {
        // Narrow the generic output to the fields the guard inspects. The
        // generic erases the `value` key in-body, so cast via `unknown`.
        const { value: v, availability } = s as unknown as {
          value: unknown;
          availability: z.infer<typeof AvailabilitySchema>;
        };
        return availability !== "unavailable" || v === null;
      },
      {
        message:
          "Fabrication guard: a Sourced marked 'unavailable' must have value === null.",
        path: ["value"],
      },
    );
}

// ---- money range ----

export const MoneyRangeSchema = z.strictObject({
  point: z.number().nullable(),
  low: z.number().nullable(),
  high: z.number().nullable(),
  currency: z.literal("USD"),
});

// ---- subsections ----

export const PropertyIdentitySchema = z.strictObject({
  formattedAddress: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  county: z.string().optional(),
  apn: z.string().optional(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  propertyType: z.string().optional(),
});

export const PropertyStructureSchema = z.strictObject({
  beds: sourced(z.number()),
  baths: sourced(z.number()),
  squareFootage: sourced(z.number()),
  lotSizeSqft: sourced(z.number()),
  yearBuilt: sourced(z.number()),
});

export const OwnershipInfoSchema = z.strictObject({
  ownerName: sourced(z.string()),
  lastSalePrice: sourced(z.number()),
  lastSaleDate: sourced(z.string()),
  priorSales: sourced(
    z.array(z.strictObject({ date: z.string(), price: z.number() })),
  ),
});

export const TaxInfoSchema = z.strictObject({
  assessedValue: sourced(z.number()),
  taxAmountAnnual: sourced(z.number()),
  taxYear: sourced(z.number()),
});

export const CompSchema = z.strictObject({
  id: z.string(),
  formattedAddress: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  price: z.number().nullable(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  squareFootage: z.number().optional(),
  distanceMiles: z.number().optional(),
  similarity: z.number().optional(),
  kind: z.enum(["sale", "rental"]),
});

export const ValuationSchema = z.strictObject({
  valueEstimate: sourced(MoneyRangeSchema),
  rentEstimate: sourced(MoneyRangeSchema),
  saleComps: sourced(z.array(CompSchema)),
  rentalComps: sourced(z.array(CompSchema)),
});

export const ZoningSchema = z.strictObject({
  code: sourced(z.string()),
  plainEnglish: sourced(z.string()),
  recentPermits: sourced(
    z.array(
      z.strictObject({
        date: z.string(),
        description: z.string(),
        status: z.string().optional(),
      }),
    ),
  ),
});

export const FloodRiskSchema = z.strictObject({
  zone: sourced(z.string()),
  inSFHA: sourced(z.boolean()),
  insuranceLikelyRequired: sourced(z.boolean()),
  panelId: z.string().optional(),
});

export const NeighborhoodSchema = z.strictObject({
  walkScore: sourced(z.number()),
  transitScore: sourced(z.number()),
  bikeScore: sourced(z.number()),
  medianHouseholdIncome: sourced(z.number()),
  ownerOccupiedRate: sourced(z.number()),
  crimeContext: sourced(z.string()),
});

export const DealReadSchema = z.strictObject({
  summary: sourced(z.string()),
  grossYieldPct: sourced(z.number()),
  dataPointsUsed: z.array(z.string()),
  confidence: ConfidenceSchema,
});

// ---- top-level dossier ----

export const DossierSchema = z.strictObject({
  id: z.string(),
  generatedAt: z.string(),
  isMock: z.boolean(),
  identity: PropertyIdentitySchema,
  structure: PropertyStructureSchema,
  ownership: OwnershipInfoSchema,
  tax: TaxInfoSchema,
  valuation: ValuationSchema,
  zoning: ZoningSchema,
  flood: FloodRiskSchema,
  neighborhood: NeighborhoodSchema,
  deal: DealReadSchema,
  warnings: z.array(z.string()),
});

/**
 * Compile-time guarantee that the schema's inferred type is assignable to the
 * hand-written `Dossier` type. If these drift apart, this line fails to compile.
 */
type _SchemaMatchesDossier =
  z.infer<typeof DossierSchema> extends Dossier ? true : false;
const _schemaMatchesDossier: _SchemaMatchesDossier = true;
void _schemaMatchesDossier;

/** Parse and return a validated Dossier; throws (ZodError) on failure. */
export function validateDossier(input: unknown): Dossier {
  return DossierSchema.parse(input) as Dossier;
}
