import { FileCache } from "./file";
import { PostgresCache } from "./postgres";
import { env } from "@/lib/config/env";
import type { Cache } from "./types";

export type { Cache, CachedDossier } from "./types";
export { FileCache } from "./file";
export { PostgresCache } from "./postgres";

/**
 * The cache the service layer uses. Postgres when `DATABASE_URL` is set,
 * otherwise a dependency-light JSON-file cache so a fresh clone runs without
 * Docker. Same `Cache` interface either way.
 */
export const cache: Cache = env.DATABASE_URL
  ? new PostgresCache()
  : new FileCache();
