/**
 * Typed environment loader.
 *
 * In M1 only `USE_MOCKS` matters; the rest are declared as optional now so later
 * milestones (M3+) just fill them in. `USE_MOCKS` defaults to `true` so a fresh
 * clone runs offline with mock data and the eval suite stays runnable.
 */
export const env = {
  /** When true, services return mock dossiers (no external calls). Default true. */
  USE_MOCKS: process.env.USE_MOCKS !== "false",
  RENTCAST_API_KEY: process.env.RENTCAST_API_KEY ?? "",
  WALKSCORE_API_KEY: process.env.WALKSCORE_API_KEY ?? "",
  CENSUS_API_KEY: process.env.CENSUS_API_KEY ?? "",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  FBI_CRIME_API_KEY: process.env.FBI_CRIME_API_KEY ?? "",
  /**
   * Lookup-cache TTL in days (default 7). The dossier bundles the property
   * record and the AVM/comps; the shorter AVM-freshness window wins. M7 can
   * split per-section TTLs once persistence moves to Postgres.
   */
  CACHE_TTL_DAYS: Number(process.env.CACHE_TTL_DAYS ?? "7"),
};
