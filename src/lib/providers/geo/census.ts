/**
 * US Census Geocoder (primary; free, no key). Uses the `geographies` endpoint
 * so we also get county/state FIPS. NOTE: Census returns coordinates as
 * `x` = longitude, `y` = latitude.
 */
import { z } from "zod";
import type { GeocodeResult } from "@/lib/providers/types";
import type { PropertyIdentity } from "@/lib/types/dossier";
import { fetchJson } from "@/lib/providers/http";

const CENSUS_URL =
  "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

const CensusSchema = z.object({
  result: z
    .object({
      addressMatches: z
        .array(
          z.object({
            matchedAddress: z.string().optional(),
            coordinates: z
              .object({ x: z.number(), y: z.number() })
              .optional(),
            addressComponents: z
              .object({
                city: z.string().optional(),
                state: z.string().optional(),
                zip: z.string().optional(),
              })
              .optional(),
            geographies: z
              .record(z.string(), z.array(z.record(z.string(), z.unknown())))
              .optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

/** Title-case a token, leaving short directionals/state codes uppercase-ish. */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

export async function geocodeCensus(
  rawAddress: string,
): Promise<GeocodeResult | null> {
  const url = new URL(CENSUS_URL);
  url.searchParams.set("address", rawAddress);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("format", "json");

  let json: unknown;
  try {
    json = await fetchJson(url.toString(), { timeoutMs: 10_000 });
  } catch {
    return null; // network/HTTP error → let the caller fall back to Nominatim
  }

  const parsed = CensusSchema.safeParse(json);
  if (!parsed.success) return null;

  const match = parsed.data.result?.addressMatches?.[0];
  if (!match || !match.coordinates) return null;

  const matched = match.matchedAddress ?? rawAddress;
  const parts = matched.split(",").map((p) => p.trim());
  const street = parts[0] ?? rawAddress;
  const city = match.addressComponents?.city ?? parts[1] ?? "";
  const state = (match.addressComponents?.state ?? parts[2] ?? "").toUpperCase();
  const zip = match.addressComponents?.zip ?? parts[3] ?? "";

  const counties = match.geographies?.["Counties"];
  const county =
    (counties?.[0]?.["BASENAME"] as string | undefined) ??
    (counties?.[0]?.["NAME"] as string | undefined);

  const addressLine1 = titleCase(street);
  const cityTitle = titleCase(city);

  const identity: PropertyIdentity = {
    formattedAddress: `${addressLine1}, ${cityTitle}, ${state} ${zip}`.trim(),
    addressLine1,
    city: cityTitle,
    state,
    zip,
    county: county ? `${titleCase(county)} County` : undefined,
    latitude: match.coordinates.y, // y = latitude
    longitude: match.coordinates.x, // x = longitude
  };

  return { identity, matched: true };
}
