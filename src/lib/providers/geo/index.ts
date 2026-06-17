/**
 * Geocoding provider: Census first, Nominatim fallback. If both fail, returns
 * `matched: false` with a minimal identity echoing the raw input so the service
 * can still render a dossier (with a warning) and never fabricate a location.
 */
import type { GeocodeProvider, GeocodeResult } from "@/lib/providers/types";
import type { PropertyIdentity } from "@/lib/types/dossier";
import { geocodeCensus } from "./census";
import { geocodeNominatim } from "./nominatim";

function minimalIdentity(rawAddress: string): PropertyIdentity {
  const parts = rawAddress.split(",").map((p) => p.trim());
  return {
    formattedAddress: rawAddress.trim(),
    addressLine1: parts[0] ?? rawAddress.trim(),
    city: parts[1] ?? "",
    state: (parts[2]?.match(/[A-Za-z]{2}/)?.[0] ?? "").toUpperCase(),
    zip: rawAddress.match(/\b\d{5}\b/)?.[0] ?? "",
    latitude: null,
    longitude: null,
  };
}

export const geocodeProvider: GeocodeProvider = {
  async geocode(rawAddress: string): Promise<GeocodeResult> {
    const census = await geocodeCensus(rawAddress);
    if (census?.matched) return census;

    const nominatim = await geocodeNominatim(rawAddress);
    if (nominatim?.matched) return nominatim;

    return { identity: minimalIdentity(rawAddress), matched: false };
  },
};
