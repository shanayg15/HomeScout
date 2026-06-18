import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { lookups } from "@/lib/db/schema";
import type { Cache, CachedDossier } from "./types";

/**
 * Postgres-backed lookup cache (same `Cache` interface as the file cache).
 * Selected when `DATABASE_URL` is set. Expired rows are treated as a miss.
 */
export class PostgresCache implements Cache {
  async get(key: string): Promise<CachedDossier | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(lookups)
        .where(eq(lookups.slug, key))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      if (row.expiresAt.getTime() <= Date.now()) return null;
      return { dossier: row.dossier, fetchedAt: row.fetchedAt.toISOString() };
    } catch {
      return null; // a cache outage should never break a lookup
    }
  }

  async set(
    key: string,
    value: CachedDossier,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      const db = getDb();
      const fetchedAt = new Date(value.fetchedAt);
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      await db
        .insert(lookups)
        .values({ slug: key, dossier: value.dossier, fetchedAt, expiresAt })
        .onConflictDoUpdate({
          target: lookups.slug,
          set: { dossier: value.dossier, fetchedAt, expiresAt },
        });
    } catch {
      // Best-effort cache write; ignore failures.
    }
  }
}
