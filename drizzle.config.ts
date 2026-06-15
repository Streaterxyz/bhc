/**
 * Drizzle Kit configuration — used by `pnpm db:push`, `db:generate`,
 * and `db:studio`. Loads .env.local explicitly so the CLI picks up the
 * database URL without us having to source it every time.
 *
 * Migrations connect via DATABASE_URL_UNPOOLED (the direct connection)
 * because PgBouncer doesn't support all the session-level commands a
 * schema migration runner needs. Falls back to DATABASE_URL if the
 * unpooled variant isn't set, which is fine during early dev.
 */

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const url =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

if (!url) {
  throw new Error(
    "DATABASE_URL (or DATABASE_URL_UNPOOLED) is not set. Add it to .env.local.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
