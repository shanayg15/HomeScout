import type {
  FloodRisk,
  Neighborhood,
  PropertyIdentity,
} from "@/lib/types/dossier";

/**
 * Assess risk & quality signals (FEMA flood, Walk Score, Census ACS, crime).
 * Stub — real implementation arrives in Milestone 5.
 */
export async function assessRisk(
  _identity: PropertyIdentity,
): Promise<{ flood: FloodRisk; neighborhood: Neighborhood }> {
  throw new Error("Not implemented — added in Milestone 5 (assessRisk).");
}
