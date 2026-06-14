import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { config } from "dotenv";
import { Client } from "pg";

/**
 * Jest `globalSetup` for the integration suite — runs ONCE, before any worker.
 *
 * Each Jest worker now owns a private database (`urlshortener_test_<id>`) that it
 * creates and migrates on first use (see `helpers/worker-database.ts`). The
 * per-test migration moved out of here and into that per-worker bootstrap, so
 * `globalSetup` is now just housekeeping that must happen once for the whole run:
 *
 *   1. Drop any per-worker databases left over from a previous run, so every run
 *      starts from a clean, freshly-migrated set of databases (and stale ones do
 *      not accumulate on the instance).
 *   2. Clear the on-disk barrier the parallel-safety demo uses.
 */
export default async function globalSetup(): Promise<void> {
  config({ quiet: true });

  rmSync(join(tmpdir(), "url-shortener-parallel-safety"), { recursive: true, force: true });

  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  if (!testDatabaseUrl) {
    throw new Error(
      "Missing TEST_DATABASE_URL. Copy .env.example to .env and start Postgres with `docker compose up -d`."
    );
  }

  await dropWorkerDatabases(testDatabaseUrl);
}

/**
 * Drop every `urlshortener_test_*` database on the instance.
 *
 * We connect to the `postgres` maintenance database and remove any per-worker
 * test database from earlier runs. `WITH (FORCE)` evicts any lingering
 * connection so the drop cannot hang. Database names come from the catalog (not
 * user input), so interpolating them is safe.
 */
const dropWorkerDatabases = async (baseUrl: string): Promise<void> => {
  const maintenance = new URL(baseUrl);
  maintenance.pathname = "/postgres";

  const client = new Client({ connectionString: maintenance.toString() });
  await client.connect();
  try {
    const result = await client.query<{ datname: string }>(
      "SELECT datname FROM pg_database WHERE datname LIKE 'urlshortener_test\\_%'"
    );
    for (const { datname } of result.rows) {
      await client.query(`DROP DATABASE IF EXISTS "${datname}" WITH (FORCE)`);
    }
  } finally {
    await client.end();
  }
};
