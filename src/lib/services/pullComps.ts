import type { PropertyIdentity, Valuation } from "@/lib/types/dossier";

/**
 * Pull value/rent estimates + sale/rental comps for a property.
 * Stub — real RentCast-backed implementation arrives in Milestone 3.
 */
export async function pullComps(
  _identity: PropertyIdentity,
): Promise<Valuation> {
  throw new Error("Not implemented — added in Milestone 3 (pullComps).");
}
