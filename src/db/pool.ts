import { Pool } from "pg";

/**
 * A single, shared PostgreSQL connection pool for the whole process.
 *
 * `pg` (node-postgres) manages a pool of reusable connections so we are not
 * opening a fresh TCP/auth handshake on every query. We create exactly one
 * pool and export it; the rest of the app (and the integration tests) borrow
 * connections from it via `pool.query(...)`.
 *
 * Which database we connect to is driven entirely by environment variables, so
 * the same code points at the dev database in normal runs and at the dedicated
 * test database under Jest:
 *
 *   - When NODE_ENV === "test" (Jest sets this automatically) we use
 *     TEST_DATABASE_URL — a separate database the tests can wipe freely.
 *   - Otherwise we use DATABASE_URL — the dev database.
 *
 * Keeping the selection here means no other module has to know about the
 * dev/test split.
 */
const connectionString =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

if (!connectionString) {
  // Fail loudly and early rather than letting `pg` attempt a confusing
  // connection to a default localhost database. A later chapter turns this
  // into proper, schema-validated config loaded at start-up.
  const expected =
    process.env.NODE_ENV === "test" ? "TEST_DATABASE_URL" : "DATABASE_URL";
  throw new Error(
    `Missing ${expected}. Copy .env.example to .env and start Postgres with \`docker compose up -d\`.`
  );
}

export const pool = new Pool({ connectionString });
