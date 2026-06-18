/**
 * Zod schemas for RAW risk-source responses, against live-verified shapes
 * (2026-06-18). Lenient (optional/nullable) so coverage gaps degrade to
 * "unavailable" rather than throwing.
 */
import { z } from "zod";

// ---- FEMA NFHL (layer 28, MapServer/query) ----
// Base: https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer

const FemaAttributesSchema = z.object({
  FLD_ZONE: z.string().nullable().optional(),
  ZONE_SUBTY: z.string().nullable().optional(),
  DFIRM_ID: z.string().nullable().optional(),
  SFHA_TF: z.string().nullable().optional(), // "T" | "F"
});

export const FemaResponseSchema = z.object({
  error: z
    .object({
      code: z.number().optional(),
      message: z.string().optional(),
    })
    .optional(),
  features: z
    .array(z.object({ attributes: FemaAttributesSchema }))
    .nullable()
    .optional(),
});

export type FemaResponse = z.infer<typeof FemaResponseSchema>;
export type FemaAttributes = z.infer<typeof FemaAttributesSchema>;

// ---- Walk Score (GET https://api.walkscore.com/score) ----

const WalkScoreSubSchema = z.object({
  score: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const WalkScoreResponseSchema = z.object({
  status: z.number().optional(),
  walkscore: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  updated: z.string().nullable().optional(),
  ws_link: z.string().nullable().optional(),
  help_link: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  transit: WalkScoreSubSchema.nullable().optional(),
  bike: WalkScoreSubSchema.nullable().optional(),
});

export type WalkScoreResponse = z.infer<typeof WalkScoreResponseSchema>;

// ---- Census geocoder (geographies by coordinates) ----

export const CensusGeographiesSchema = z.object({
  result: z
    .object({
      geographies: z
        .record(z.string(), z.array(z.record(z.string(), z.unknown())))
        .optional(),
    })
    .optional(),
});

export type CensusGeographies = z.infer<typeof CensusGeographiesSchema>;

// ---- Census ACS data API (2-D array of strings) ----

export const CensusAcsResponseSchema = z.array(z.array(z.string()));
export type CensusAcsResponse = z.infer<typeof CensusAcsResponseSchema>;
