/**
 * US Census ACS 5-year demographics for a property's census tract.
 *
 * The tract FIPS comes from the keyless geographies geocoder; the ACS data
 * itself now REQUIRES a key (`CENSUS_API_KEY`, free; mandatory since 2026-05-12).
 * Negative "jam" sentinels (e.g. -666666666) are treated as null - never shown.
 * Latest ACS vintage is 2024 (falls back to 2023).
 */
import { env } from "@/lib/config/env";
import type { PropertyIdentity, Sourced } from "@/lib/types/dossier";
import { fetchJson } from "@/lib/providers/http";
import {
  CensusGeographiesSchema,
  CensusAcsResponseSchema,
  type CensusAcsResponse,
} from "@/lib/schemas/risk";

export interface DemographicsParts {
  medianHouseholdIncome: Sourced<number>;
  ownerOccupiedRate: Sourced<number>;
}

const ACS_YEARS = ["2024", "2023"];

function un(note: string): Sourced<number> {
  return { value: null, source: "census", confidence: "low", availability: "unavailable", note };
}

function av(value: number, asOf: string): Sourced<number> {
  return { value, source: "census", confidence: "high", availability: "available", asOf };
}

/** Census numbers arrive as strings; negatives are "not available" sentinels. */
function cleanNumber(raw: string | undefined): number | null {
  if (raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/** Pure mapper from a (validated) ACS 2-D array. */
export function mapCensusAcs(
  resp: CensusAcsResponse,
  year: string,
): DemographicsParts {
  if (resp.length < 2) {
    const note = "No demographic data for this area.";
    return { medianHouseholdIncome: un(note), ownerOccupiedRate: un(note) };
  }
  const headers = resp[0];
  const row = resp[1];
  const idx = (code: string) => headers.indexOf(code);

  const income = cleanNumber(row[idx("B19013_001E")]);
  const totalOccupied = cleanNumber(row[idx("B25003_001E")]);
  const ownerOccupied = cleanNumber(row[idx("B25003_002E")]);
  const rate =
    totalOccupied && totalOccupied > 0 && ownerOccupied != null
      ? Math.round((ownerOccupied / totalOccupied) * 1000) / 1000
      : null;

  return {
    medianHouseholdIncome:
      income !== null ? av(income, year) : un("Median income not available for this tract."),
    ownerOccupiedRate:
      rate !== null ? av(rate, year) : un("Tenure data not available for this tract."),
  };
}

async function resolveTract(
  identity: PropertyIdentity,
): Promise<{ state: string; county: string; tract: string } | null> {
  const url = new URL(
    "https://geocoding.geo.census.gov/geocoder/geographies/coordinates",
  );
  url.searchParams.set("x", String(identity.longitude));
  url.searchParams.set("y", String(identity.latitude));
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("format", "json");

  try {
    const json = await fetchJson(url.toString(), { timeoutMs: 10_000 });
    const parsed = CensusGeographiesSchema.safeParse(json);
    if (!parsed.success) return null;
    const tracts = parsed.data.result?.geographies?.["Census Tracts"];
    const t = tracts?.[0];
    if (!t) return null;
    const state = t["STATE"] as string | undefined;
    const county = t["COUNTY"] as string | undefined;
    const tract = t["TRACT"] as string | undefined;
    if (!state || !county || !tract) return null;
    return { state, county, tract };
  } catch {
    return null;
  }
}

export async function getDemographics(
  identity: PropertyIdentity,
): Promise<DemographicsParts> {
  if (!env.CENSUS_API_KEY) {
    const note = "Census API key not configured.";
    return { medianHouseholdIncome: un(note), ownerOccupiedRate: un(note) };
  }
  if (identity.latitude == null || identity.longitude == null) {
    const note = "No coordinates to look up demographics.";
    return { medianHouseholdIncome: un(note), ownerOccupiedRate: un(note) };
  }

  const geo = await resolveTract(identity);
  if (!geo) {
    const note = "Could not resolve a census tract for this address.";
    return { medianHouseholdIncome: un(note), ownerOccupiedRate: un(note) };
  }

  for (const year of ACS_YEARS) {
    const url = new URL(`https://api.census.gov/data/${year}/acs/acs5`);
    url.searchParams.set(
      "get",
      "NAME,B19013_001E,B25003_001E,B25003_002E",
    );
    url.searchParams.set("for", `tract:${geo.tract}`);
    url.searchParams.set("in", `state:${geo.state} county:${geo.county}`);
    url.searchParams.set("key", env.CENSUS_API_KEY);

    try {
      const json = await fetchJson(url.toString(), { timeoutMs: 10_000 });
      const parsed = CensusAcsResponseSchema.safeParse(json);
      if (parsed.success && parsed.data.length >= 2) {
        return mapCensusAcs(parsed.data, year);
      }
    } catch {
      // try the next (older) ACS vintage
    }
  }

  const note = "Demographic data not available for this area.";
  return { medianHouseholdIncome: un(note), ownerOccupiedRate: un(note) };
}
