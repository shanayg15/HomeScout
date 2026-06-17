import { FileCache } from "./file";
import type { Cache } from "./types";

export type { Cache, CachedDossier } from "./types";
export { FileCache } from "./file";

/** The cache the service layer uses. Swap the impl here (Postgres in M7). */
export const cache: Cache = new FileCache();
