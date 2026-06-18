import { defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_URL ||
  "postgres://homescout:homescout@localhost:5450/homescout";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
