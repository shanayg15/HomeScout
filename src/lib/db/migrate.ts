/**
 * Apply Drizzle migrations. Run with `npm run db:migrate` after
 * `docker compose up -d` (or against any Postgres via DATABASE_URL).
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const url =
  process.env.DATABASE_URL ||
  "postgres://homescout:homescout@localhost:5450/homescout";

async function main() {
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await pool.end();
  console.log("Migrations applied.");
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
