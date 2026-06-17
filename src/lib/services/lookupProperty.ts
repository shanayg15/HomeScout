import { getMockDossier } from "@/lib/providers/mock/mockProperty";
import { env } from "@/lib/config/env";
import { validateDossier } from "@/lib/schemas/dossier";
import type { Dossier } from "@/lib/types/dossier";

/**
 * The core verb: raw address in → validated {@link Dossier} out. The UI and API
 * routes only ever call this; all real orchestration lives here and in the
 * providers behind it.
 *
 * M1: mocks only. M3 wires real providers (RentCast + geocoding + cache) behind
 * `env.USE_MOCKS === false`.
 */
export async function lookupProperty(rawAddress: string): Promise<Dossier> {
  if (env.USE_MOCKS) {
    const dossier = getMockDossier(rawAddress);
    // Prove the contract holds even for mocks.
    return validateDossier(dossier);
  }

  throw new Error(
    "Real providers are not implemented yet (added in Milestone 3). Set USE_MOCKS=true.",
  );
}
