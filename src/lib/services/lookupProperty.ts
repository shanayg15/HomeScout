// EVAL CONTRACT: any change to the Dossier shape, scoring, or confidence
// mapping must be re-validated with `npm run eval`. The eval suite asserts
// data-safety properties (no fabrication, coherent ranges, no absolute verdict,
// confidence-at-most on thin data) that must keep holding as providers change.
import { getMockDossier } from "@/lib/providers/mock/mockProperty";
import { env } from "@/lib/config/env";
import { validateDossier } from "@/lib/schemas/dossier";
import type { Dossier, Valuation } from "@/lib/types/dossier";
import { getProviders } from "@/lib/providers";
import { pullComps } from "./pullComps";
import { cache } from "@/lib/cache";
import { addressToSlug } from "@/lib/utils/id";
import { RateLimitedError } from "@/lib/providers/http";
import { buildDealRead } from "@/lib/deal/scoring";
import {
  placeholderFlood,
  placeholderNeighborhood,
  emptyStructure,
  emptyOwnership,
  emptyTax,
  emptyZoning,
  emptyValuation,
} from "./placeholders";

const NOT_FOUND_TTL_SECONDS = 24 * 60 * 60; // 1 day

/**
 * The core verb: raw address in → validated {@link Dossier} out. The UI and API
 * routes only ever call this.
 *
 * Mock path (`USE_MOCKS=true`, the default) returns the monolithic mock dossier
 * — preserving the eval sentinels. Real path orchestrates geocoding → cache →
 * RentCast record + AVM/comps → deterministic gross yield, with M5/M6 sections
 * as graceful "unavailable" placeholders. Never fabricates a value.
 */
export async function lookupProperty(
  rawAddress: string,
  opts: { refresh?: boolean } = {},
): Promise<Dossier> {
  if (env.USE_MOCKS) {
    return validateDossier(getMockDossier(rawAddress));
  }
  return lookupPropertyReal(rawAddress, opts);
}

async function lookupPropertyReal(
  rawAddress: string,
  opts: { refresh?: boolean },
): Promise<Dossier> {
  const providers = getProviders();
  const warnings: string[] = [];
  let providerErrored = false;

  // 1. Geocode / normalize.
  const geo = await providers.geo.geocode(rawAddress);
  if (!geo.matched) {
    warnings.push("Could not resolve this address — results may be limited.");
  }

  // 2. Stable cache key.
  const key =
    addressToSlug(geo.matched ? geo.identity.formattedAddress : rawAddress) ||
    "unknown";

  // 3. Cache check (unless refreshing).
  if (!opts.refresh) {
    const cached = await cache.get(key);
    if (cached) {
      try {
        return validateDossier(cached.dossier);
      } catch {
        // Stale/invalid cache shape — fall through and refetch.
      }
    }
  }

  // 4. Property record (identity/structure/ownership/tax/zoning).
  let record: Partial<Dossier> = {};
  try {
    record = await providers.property.getPropertyRecord(geo.identity);
    if (record.warnings) warnings.push(...record.warnings);
  } catch (err) {
    providerErrored = true;
    warnings.push(
      err instanceof RateLimitedError
        ? "RentCast quota/rate limit reached — property record is incomplete."
        : "Property record lookup failed — showing what we could find.",
    );
  }

  // 5. Valuation + comps.
  let valuation: Valuation;
  try {
    valuation = await pullComps(geo.identity);
  } catch (err) {
    providerErrored = true;
    warnings.push(
      err instanceof RateLimitedError
        ? "RentCast quota/rate limit reached — value/rent estimates are unavailable."
        : "Value/rent estimate lookup failed.",
    );
    valuation = emptyValuation();
  }

  // 6. Assemble. Sections missing because of a provider error degrade to
  //    unavailable — never a fabricated number.
  const identity = record.identity ?? geo.identity;
  const structure = record.structure ?? emptyStructure();
  const ownership = record.ownership ?? emptyOwnership();
  const tax = record.tax ?? emptyTax();
  const zoning = record.zoning ?? emptyZoning();

  const deal = buildDealRead(
    valuation.valueEstimate.value?.point ?? null,
    valuation.rentEstimate.value?.point ?? null,
  );

  if (
    valuation.valueEstimate.availability === "unavailable" &&
    valuation.rentEstimate.availability === "unavailable"
  ) {
    warnings.push("Limited data coverage for this area — confidence is reduced.");
  }

  const assembled: Dossier = {
    id: key,
    generatedAt: new Date().toISOString(),
    isMock: false,
    identity,
    structure,
    ownership,
    tax,
    valuation,
    zoning,
    flood: placeholderFlood(),
    neighborhood: placeholderNeighborhood(),
    deal,
    warnings: Array.from(new Set(warnings)),
  };

  const dossier = validateDossier(assembled);

  // 7. Cache — but never cache a transient provider error.
  if (!providerErrored) {
    const notFound = (record.warnings?.length ?? 0) > 0;
    const ttlSeconds = notFound
      ? NOT_FOUND_TTL_SECONDS
      : env.CACHE_TTL_DAYS * 24 * 60 * 60;
    await cache.set(key, { dossier, fetchedAt: dossier.generatedAt }, ttlSeconds);
  }

  return dossier;
}
