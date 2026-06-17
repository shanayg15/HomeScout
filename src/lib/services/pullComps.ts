import { env } from "@/lib/config/env";
import { getProviders } from "@/lib/providers";
import { getMockDossier } from "@/lib/providers/mock/mockProperty";
import type { PropertyIdentity, Valuation } from "@/lib/types/dossier";

/**
 * Pull value/rent estimates + sale/rental comps for a property. Real path uses
 * the RentCast valuation provider; mock path returns the mock valuation so
 * offline dev and evals keep working.
 */
export async function pullComps(
  identity: PropertyIdentity,
): Promise<Valuation> {
  if (env.USE_MOCKS) {
    return getMockDossier(identity.formattedAddress).valuation;
  }
  return getProviders().valuation.getValuation(identity);
}
