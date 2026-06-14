import { execSync } from "node:child_process";
import { Client } from "pg";

/**
 * Per-worker test database, keyed on Jest's `JEST_WORKER_ID`.
 *
 * When Jest runs the integration suite across several workers, they would all
 * hit the SAME test database and clobber each other's rows (one worker's
 * `beforeEach` truncate wipes another worker's just-inserted data). The fix is
 * to give every worker its own database: worker 1 uses `urlshortener_test_1`,
 * worker 2 uses `urlshortener_test_2`, and so on. Workers can never see or
 * truncate each other's tables, so the suite is safe to run in parallel.
 *
 * We chose a per-worker DATABASE over a per-worker SCHEMA: it is the simplest
 * mental model (one instance, many databases — exactly the dev/test split from
 * chapter 9) and needs no `search_path` wiring for the raw `pg` pool. A
 * per-worker schema is cheaper to create but spreads the routing across both the
 * Prisma URL and the pool's `search_path`; we trade a little setup cost for that
 * simplicity.
 */

const BASE_TEST_DB = "urlshortener_test";

/** The per-worker database name, e.g. `urlshortener_test_3`. */
export const workerDatabaseName = (workerId = process.env.JEST_WORKER_ID ?? "1"): string =>
  `${BASE_TEST_DB}_${workerId}`;

/** A connection string that points at this worker's database. */
export const workerDatabaseUrl = (baseUrl: string, workerId?: string): string => {
  const url = new URL(baseUrl);
  url.pathname = `/${workerDatabaseName(workerId)}`;
  return url.toString();
};

/** A connection string for the `postgres` maintenance database on the same instance. */
const maintenanceUrl = (baseUrl: string): string => {
  const url = new URL(baseUrl);
  url.pathname = "/postgres";
  return url.toString();
};

/**
 * Create this worker's database if it does not already exist.
 *
 * PostgreSQL has no `CREATE DATABASE IF NOT EXISTS`, so we connect to the
 * `postgres` maintenance database, check the `pg_database` catalog, and only
 * issue `CREATE DATABASE` when the row is missing. The database name is a fixed
 * `urlshortener_test_<id>` (never user input), so interpolating it is safe.
 */
const createDatabaseIfAbsent = async (baseUrl: string, name: string): Promise<void> => {
  const client = new Client({ connectionString: maintenanceUrl(baseUrl) });
  await client.connect();
  try {
    const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${name}"`);
    }
  } finally {
    await client.end();
  }
};

/**
 * Ensure this worker's database exists and is migrated, then return its URL.
 *
 * Runs once per worker (the caller guards it): create the database if missing,
 * then apply the committed migrations to it with `prisma migrate deploy` —
 * non-interactive, applies `prisma/migrations/` exactly as written. The result
 * is a fully-migrated database that only this worker touches.
 */
export const ensureWorkerDatabase = async (baseTestUrl: string): Promise<string> => {
  const name = workerDatabaseName();
  const url = workerDatabaseUrl(baseTestUrl);

  await createDatabaseIfAbsent(baseTestUrl, name);

  execSync("npx prisma migrate deploy", {
    stdio: "ignore",
    env: { ...process.env, DATABASE_URL: url },
  });

  return url;
};
