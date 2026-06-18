/**
 * Zod schemas for RAW RentCast responses, against the live-verified schema
 * (developers.rentcast.io, June 2026). These are intentionally lenient -
 * every field optional/nullable - because coverage varies by county/state and
 * we must degrade to "unavailable" rather than throw. We validate shape, then
 * map into our `Sourced<>` dossier fields (mapRentCast.ts).
 *
 * Key verified facts baked in here:
 *  - GET /properties returns an ARRAY (empty [] = not found).
 *  - owner is { names: string[] } - there is no flat ownerName.
 *  - taxAssessments / propertyTaxes / history are OBJECTS keyed by year/date.
 *  - AVM responses are single OBJECTS; a comp's value (sale OR rent) is `price`;
 *    similarity is `correlation`.
 */
import { z } from "zod";

const TaxAssessmentSchema = z.object({
  year: z.number().optional(),
  value: z.number().nullable().optional(),
  land: z.number().nullable().optional(),
  improvements: z.number().nullable().optional(),
});

const PropertyTaxSchema = z.object({
  year: z.number().optional(),
  total: z.number().nullable().optional(),
});

const HistoryEntrySchema = z.object({
  event: z.string().optional(),
  date: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
});

const OwnerSchema = z
  .object({
    names: z.array(z.string()).nullable().optional(),
    type: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

export const RentCastPropertySchema = z.object({
  id: z.string().optional(),
  formattedAddress: z.string().nullable().optional(),
  addressLine1: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  countyFips: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  propertyType: z.string().nullable().optional(),
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  squareFootage: z.number().nullable().optional(),
  lotSize: z.number().nullable().optional(),
  yearBuilt: z.number().nullable().optional(),
  assessorID: z.string().nullable().optional(),
  zoning: z.string().nullable().optional(),
  lastSaleDate: z.string().nullable().optional(),
  lastSalePrice: z.number().nullable().optional(),
  owner: OwnerSchema,
  taxAssessments: z.record(z.string(), TaxAssessmentSchema).nullable().optional(),
  propertyTaxes: z.record(z.string(), PropertyTaxSchema).nullable().optional(),
  history: z.record(z.string(), HistoryEntrySchema).nullable().optional(),
});

export const RentCastPropertiesResponseSchema = z.array(RentCastPropertySchema);

export const RentCastCompSchema = z.object({
  id: z.string().optional(),
  formattedAddress: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  // For BOTH sale and rental comps, the comp's value lives in `price`.
  price: z.number().nullable().optional(),
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  squareFootage: z.number().nullable().optional(),
  distance: z.number().nullable().optional(),
  // Similarity score (0..1). NOT named `similarity`.
  correlation: z.number().nullable().optional(),
});

export const RentCastValueAvmSchema = z.object({
  price: z.number().nullable().optional(),
  priceRangeLow: z.number().nullable().optional(),
  priceRangeHigh: z.number().nullable().optional(),
  comparables: z.array(RentCastCompSchema).nullable().optional(),
});

export const RentCastRentAvmSchema = z.object({
  rent: z.number().nullable().optional(),
  rentRangeLow: z.number().nullable().optional(),
  rentRangeHigh: z.number().nullable().optional(),
  comparables: z.array(RentCastCompSchema).nullable().optional(),
});

export type RentCastProperty = z.infer<typeof RentCastPropertySchema>;
export type RentCastComp = z.infer<typeof RentCastCompSchema>;
export type RentCastValueAvm = z.infer<typeof RentCastValueAvmSchema>;
export type RentCastRentAvm = z.infer<typeof RentCastRentAvmSchema>;
