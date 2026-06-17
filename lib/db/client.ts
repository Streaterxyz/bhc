/**
 * Single Drizzle client used by every server-side query in the app.
 *
 * Uses @neondatabase/serverless because it's WebSocket-friendly and
 * cold-starts cleanly inside Vercel functions. The Pool here is reused
 * across invocations within the same warm function instance.
 *
 * IMPORTANT: only import this from server code (route handlers, server
 * components, server actions). Never from a client component — the
 * "server-only" guard below makes such an import fail at BUILD time
 * rather than throwing in the browser at runtime.
 */

import "server-only";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema";

// In Node runtimes (Drizzle Kit migrations, scripts) the ws library
// provides a WebSocket implementation. The browser globals already
// have WebSocket so neonConfig auto-detects in those.
if (typeof WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  neonConfig.webSocketConstructor = ws as any;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (and to Vercel env for prod).",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export { schema };
