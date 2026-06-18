/**
 * Crime context — DELIBERATELY OMITTED for v1.
 *
 * The FBI Crime Data API only exposes data reliably at the STATE level (and
 * unevenly at the agency level), with an ~18-month lag. Presenting a statewide
 * number next to a specific property invites users to read it as a
 * neighborhood/parcel safety signal — exactly the misuse the guardrails forbid.
 * Per the build plan ("responsible-not-fabricated beats complete-but-wrong"),
 * we mark crime context unavailable with an honest reason rather than show
 * something misleading. (A future enhancement could surface explicitly-labeled
 * STATE context, opt-in.)
 */
import type { PropertyIdentity, Sourced } from "@/lib/types/dossier";

export interface CrimeParts {
  crimeContext: Sourced<string>;
}

export async function getCrime(
  _identity: PropertyIdentity,
): Promise<CrimeParts> {
  return {
    crimeContext: {
      value: null,
      source: "fbi_crime",
      confidence: "low",
      availability: "unavailable",
      note: "Crime data is only published reliably at the state level, which is too coarse to present responsibly for a specific property.",
    },
  };
}
