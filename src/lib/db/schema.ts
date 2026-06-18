import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import type { Dossier } from "@/lib/types/dossier";

/**
 * Lookup cache, keyed by normalized address slug. Mirrors the M3 `Cache`
 * interface (dossier + freshness + expiry), now backed by Postgres so it
 * survives restarts and is shared across instances.
 */
export const lookups = pgTable("lookups", {
  slug: text("slug").primaryKey(),
  dossier: jsonb("dossier").$type<Dossier>().notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
