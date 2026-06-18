/**
 * FEMA National Flood Hazard Layer (NFHL) - flood zone by coordinates.
 * Keyless. Live-verified base + layer (2026-06-18):
 *   https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query
 * (layer 28 = "Flood Hazard Zones" / S_FLD_HAZ_AR). Authoritative SFHA flag is
 * `SFHA_TF` ("T"/"F"). Empty features = NO DETERMINATION, never "no risk".
 */
import type { FloodRisk, PropertyIdentity, Sourced } from "@/lib/types/dossier";
import { fetchJson } from "@/lib/providers/http";
import { FemaResponseSchema, type FemaResponse } from "@/lib/schemas/risk";

const NFHL_QUERY =
  "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query";

const SFHA_ZONES = new Set(["A", "AE", "AH", "AO", "AR", "A99", "V", "VE", "VO"]);

function un<T>(note: string): Sourced<T> {
  return { value: null, source: "fema", confidence: "low", availability: "unavailable", note };
}

function av<T>(value: T, asOf: string, note?: string): Sourced<T> {
  return { value, source: "fema", confidence: "high", availability: "available", asOf, note };
}

/** Pure mapper from a (validated) FEMA response into our FloodRisk. */
export function mapFemaFlood(resp: FemaResponse, fetchedAt: string): FloodRisk {
  const noCoverage = "No FEMA flood map determination available for this location.";

  if (resp.error) {
    return {
      zone: un("FEMA flood service returned an error."),
      inSFHA: un("FEMA flood service returned an error."),
      insuranceLikelyRequired: un("FEMA flood service returned an error."),
    };
  }

  const features = resp.features ?? [];
  if (features.length === 0) {
    return {
      zone: un(noCoverage),
      inSFHA: un(noCoverage),
      insuranceLikelyRequired: un(noCoverage),
    };
  }

  // A point can intersect more than one polygon - the SFHA polygon wins.
  const feat = features.find((f) => f.attributes.SFHA_TF === "T") ?? features[0];
  const a = feat.attributes;
  const zone = a.FLD_ZONE ?? null;
  if (!zone) {
    return {
      zone: un(noCoverage),
      inSFHA: un(noCoverage),
      insuranceLikelyRequired: un(noCoverage),
    };
  }

  const inSFHA = a.SFHA_TF === "T" || SFHA_ZONES.has(zone.toUpperCase());
  const subty = a.ZONE_SUBTY ?? undefined;
  const zoneNote =
    zone.toUpperCase() === "D"
      ? "Zone D - flood risk is undetermined/unstudied here, not necessarily low."
      : subty && /0\.2 ?PCT/i.test(subty)
        ? "Shaded X - moderate (0.2% annual / 500-year) flood risk, outside the SFHA."
        : undefined;

  return {
    zone: av(zone, fetchedAt, zoneNote),
    inSFHA: av(inSFHA, fetchedAt),
    insuranceLikelyRequired: av(inSFHA, fetchedAt, "Informational only - not a certified flood determination."),
    panelId: a.DFIRM_ID ?? undefined,
  };
}

export async function getFlood(identity: PropertyIdentity): Promise<FloodRisk> {
  const fetchedAt = new Date().toISOString();
  if (identity.latitude == null || identity.longitude == null) {
    return mapFemaFlood({ features: [] }, fetchedAt);
  }

  const url = new URL(NFHL_QUERY);
  url.searchParams.set("geometry", `${identity.longitude},${identity.latitude}`); // lng,lat
  url.searchParams.set("geometryType", "esriGeometryPoint");
  url.searchParams.set("inSR", "4326");
  url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
  url.searchParams.set("outFields", "FLD_ZONE,ZONE_SUBTY,DFIRM_ID,SFHA_TF");
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("f", "json");

  try {
    const json = await fetchJson(url.toString(), { timeoutMs: 10_000 });
    const parsed = FemaResponseSchema.safeParse(json);
    if (!parsed.success) return mapFemaFlood({ features: [] }, fetchedAt);
    return mapFemaFlood(parsed.data, fetchedAt);
  } catch {
    return mapFemaFlood({ error: { message: "fetch failed" } }, fetchedAt);
  }
}
