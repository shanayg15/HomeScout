import { env } from "@/lib/config/env";
import type {
  FloodRisk,
  Neighborhood,
  PropertyIdentity,
} from "@/lib/types/dossier";
import { getMockDossier } from "@/lib/providers/mock/mockProperty";
import { getFlood } from "@/lib/providers/risk/femaFlood";
import { getWalkability } from "@/lib/providers/risk/walkscore";
import { getDemographics } from "@/lib/providers/risk/censusAcs";
import { getCrime } from "@/lib/providers/risk/crime";
import { placeholderFlood, placeholderNeighborhood } from "./placeholders";

/**
 * Assess risk & quality signals: FEMA flood + Walk Score + Census ACS + crime,
 * fetched in PARALLEL so one slow/failed source never blocks the others. Each
 * provider already degrades to "unavailable" internally; `Promise.allSettled`
 * + placeholder fallbacks are belt-and-suspenders. Never fabricates.
 */
export async function assessRisk(
  identity: PropertyIdentity,
): Promise<{ flood: FloodRisk; neighborhood: Neighborhood }> {
  if (env.USE_MOCKS) {
    const mock = getMockDossier(identity.formattedAddress);
    return { flood: mock.flood, neighborhood: mock.neighborhood };
  }

  const [floodRes, walkRes, demoRes, crimeRes] = await Promise.allSettled([
    getFlood(identity),
    getWalkability(identity),
    getDemographics(identity),
    getCrime(identity),
  ]);

  const flood =
    floodRes.status === "fulfilled" ? floodRes.value : placeholderFlood();
  const walk = walkRes.status === "fulfilled" ? walkRes.value : null;
  const demo = demoRes.status === "fulfilled" ? demoRes.value : null;
  const crime = crimeRes.status === "fulfilled" ? crimeRes.value : null;

  const ph = placeholderNeighborhood();
  const neighborhood: Neighborhood = {
    walkScore: walk?.walkScore ?? ph.walkScore,
    transitScore: walk?.transitScore ?? ph.transitScore,
    bikeScore: walk?.bikeScore ?? ph.bikeScore,
    medianHouseholdIncome: demo?.medianHouseholdIncome ?? ph.medianHouseholdIncome,
    ownerOccupiedRate: demo?.ownerOccupiedRate ?? ph.ownerOccupiedRate,
    crimeContext: crime?.crimeContext ?? ph.crimeContext,
  };

  return { flood, neighborhood };
}
