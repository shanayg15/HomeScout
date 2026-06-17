import type { Dossier } from "@/lib/types/dossier";

export interface CachedDossier {
  dossier: Dossier;
  /** ISO timestamp of when the underlying data was fetched. */
  fetchedAt: string;
}

/**
 * Lookup cache. Keyed by normalized address slug so a repeat lookup costs 0 API
 * calls. Abstracted so M7 can swap the file impl for Postgres without touching
 * the service layer.
 */
export interface Cache {
  get(key: string): Promise<CachedDossier | null>;
  set(key: string, value: CachedDossier, ttlSeconds: number): Promise<void>;
}
