import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/config/env";
import * as schema from "./schema";

let pool: Pool | null = null;

/** Lazily-created Drizzle client (only connects when the Postgres cache is used). */
export function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: env.DATABASE_URL });
  }
  return drizzle(pool, { schema });
}
