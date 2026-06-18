/**
 * Walk Score API — walkability/transit/bike for a lat/lng. Requires a free
 * `WALKSCORE_API_KEY`. Branch on the JSON `status` (1 = success); transit/bike
 * are frequently null. Walk Score® attribution is rendered in the UI (RiskPanel).
 */
import { env } from "@/lib/config/env";
import type { PropertyIdentity, Sourced } from "@/lib/types/dossier";
import { fetchJson } from "@/lib/providers/http";
import {
  WalkScoreResponseSchema,
  type WalkScoreResponse,
} from "@/lib/schemas/risk";

export interface WalkabilityParts {
  walkScore: Sourced<number>;
  transitScore: Sourced<number>;
  bikeScore: Sourced<number>;
}

const STATUS_NOTE: Record<number, string> = {
  2: "Walk Score is still being calculated for this location.",
  30: "Walk Score could not resolve these coordinates.",
  31: "Walk Score service error — try again later.",
  40: "Walk Score API key is invalid.",
  41: "Walk Score daily quota exceeded.",
  42: "Walk Score access blocked.",
};

function un(note: string): Sourced<number> {
  return { value: null, source: "walkscore", confidence: "low", availability: "unavailable", note };
}

function av(value: number, asOf: string): Sourced<number> {
  return { value, source: "walkscore", confidence: "high", availability: "available", asOf };
}

/** Pure mapper from a (validated) Walk Score response. */
export function mapWalkScore(
  resp: WalkScoreResponse,
  fetchedAt: string,
): WalkabilityParts {
  if (resp.status !== 1) {
    const note = STATUS_NOTE[resp.status ?? -1] ?? "Walkability not available for this location.";
    return { walkScore: un(note), transitScore: un(note), bikeScore: un(note) };
  }

  const walkScore =
    typeof resp.walkscore === "number" ? av(resp.walkscore, fetchedAt) : un("Walk Score not available here.");
  const transitScore =
    typeof resp.transit?.score === "number"
      ? av(resp.transit.score, fetchedAt)
      : un("Transit Score not available for this area.");
  const bikeScore =
    typeof resp.bike?.score === "number"
      ? av(resp.bike.score, fetchedAt)
      : un("Bike Score not available for this area.");

  return { walkScore, transitScore, bikeScore };
}

export async function getWalkability(
  identity: PropertyIdentity,
): Promise<WalkabilityParts> {
  const fetchedAt = new Date().toISOString();

  if (!env.WALKSCORE_API_KEY) {
    const note = "Walk Score API key not configured.";
    return { walkScore: un(note), transitScore: un(note), bikeScore: un(note) };
  }
  if (identity.latitude == null || identity.longitude == null) {
    const note = "No coordinates to look up walkability.";
    return { walkScore: un(note), transitScore: un(note), bikeScore: un(note) };
  }

  const url = new URL("https://api.walkscore.com/score");
  url.searchParams.set("format", "json");
  url.searchParams.set("address", identity.formattedAddress);
  url.searchParams.set("lat", String(identity.latitude));
  url.searchParams.set("lon", String(identity.longitude));
  url.searchParams.set("transit", "1");
  url.searchParams.set("bike", "1");
  url.searchParams.set("wsapikey", env.WALKSCORE_API_KEY);

  try {
    const json = await fetchJson(url.toString(), { timeoutMs: 10_000 });
    const parsed = WalkScoreResponseSchema.safeParse(json);
    if (!parsed.success) {
      const note = "Walkability response could not be read.";
      return { walkScore: un(note), transitScore: un(note), bikeScore: un(note) };
    }
    return mapWalkScore(parsed.data, fetchedAt);
  } catch {
    const note = "Walkability lookup failed.";
    return { walkScore: un(note), transitScore: un(note), bikeScore: un(note) };
  }
}
