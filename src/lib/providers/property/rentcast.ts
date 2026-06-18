/**
 * RentCast provider - the backbone for identity/structure/ownership/tax and the
 * value/rent AVM + comps. Implements both `PropertyProvider` and
 * `ValuationProvider`. Validates raw responses with Zod (degrading to
 * "unavailable" on a shape mismatch rather than throwing the page) and maps via
 * the pure functions in `mapRentCast.ts`.
 */
import { z } from "zod";
import { env } from "@/lib/config/env";
import type { Dossier, PropertyIdentity, Valuation } from "@/lib/types/dossier";
import type { PropertyProvider, ValuationProvider } from "@/lib/providers/types";
import {
  fetchJson,
  NotFoundError,
  ProviderError,
} from "@/lib/providers/http";
import { recordRentCastCall } from "@/lib/providers/callCounter";
import {
  RentCastPropertiesResponseSchema,
  RentCastValueAvmSchema,
  RentCastRentAvmSchema,
  type RentCastProperty,
} from "@/lib/schemas/rentcast";
import { mapRentCastProperty, mapRentCastAvm } from "./mapRentCast";

const BASE = "https://api.rentcast.io/v1";

/** RentCast wants a single-line "Street, City, State, Zip". */
function rentCastAddress(identity: PropertyIdentity): string {
  const parts = [
    identity.addressLine1,
    identity.city,
    identity.state,
    identity.zip,
  ].filter((p) => p && p.trim().length > 0);
  return parts.length > 0 ? parts.join(", ") : identity.formattedAddress;
}

/** HTTP + counter. Throws typed errors (NotFound/RateLimited/Provider). */
async function rentcastFetch(
  path: string,
  params: Record<string, string>,
): Promise<unknown> {
  if (!env.RENTCAST_API_KEY) {
    throw new ProviderError("RENTCAST_API_KEY is not set.");
  }
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  recordRentCastCall(path);
  return fetchJson(url.toString(), {
    headers: { "X-Api-Key": env.RENTCAST_API_KEY },
    timeoutMs: 10_000,
  });
}

/** Fetch + validate an AVM endpoint; returns null on 404 (no estimate). */
async function fetchAvm<S extends z.ZodTypeAny>(
  path: string,
  identity: PropertyIdentity,
  schema: S,
): Promise<z.infer<S> | null> {
  try {
    const json = await rentcastFetch(path, {
      address: rentCastAddress(identity),
    });
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.warn(`[rentcast] ${path} response failed validation; treating as unavailable`);
      return null;
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof NotFoundError) return null; // AVM 404 = no estimate
    throw err; // RateLimited / ProviderError bubble to the service
  }
}

export class RentCastProvider implements PropertyProvider, ValuationProvider {
  async getPropertyRecord(identity: PropertyIdentity): Promise<Partial<Dossier>> {
    const fetchedAt = new Date().toISOString();
    let raw: RentCastProperty | undefined;

    try {
      const json = await rentcastFetch("/properties", {
        address: rentCastAddress(identity),
      });
      const parsed = RentCastPropertiesResponseSchema.safeParse(json);
      if (!parsed.success) {
        console.warn("[rentcast] /properties response failed validation; treating as not found");
        raw = undefined;
      } else {
        raw = parsed.data[0]; // empty array → undefined (not found)
      }
    } catch (err) {
      if (err instanceof NotFoundError) {
        raw = undefined;
      } else {
        throw err; // RateLimited / ProviderError bubble to the service
      }
    }

    const m = mapRentCastProperty(raw, identity, fetchedAt);
    return {
      identity: m.identity,
      structure: m.structure,
      ownership: m.ownership,
      tax: m.tax,
      zoning: m.zoning,
      warnings: m.found ? [] : ["No property record found for this address."],
    };
  }

  async getValuation(identity: PropertyIdentity): Promise<Valuation> {
    const fetchedAt = new Date().toISOString();
    const value = await fetchAvm("/avm/value", identity, RentCastValueAvmSchema);
    const rent = await fetchAvm(
      "/avm/rent/long-term",
      identity,
      RentCastRentAvmSchema,
    );
    return mapRentCastAvm(value, rent, fetchedAt);
  }
}
