import { config } from "dotenv";
import { workerDatabaseUrl } from "./helpers/worker-database";

/**
 * Jest `setupFiles` entry for the integration suite.
 *
 * It runs once per worker, before any test module is imported, and loads the
 * variables from `.env` into `process.env`. Jest already sets NODE_ENV="test",
 * so the `pg` pool automatically targets the test database.
 */
config({ quiet: true });

/**
 * Point both the `pg` pool and Prisma at THIS worker's own test database.
 *
 * Every Jest worker gets a private database named `urlshortener_test_<id>`
 * (keyed on JEST_WORKER_ID), so parallel workers can never see or truncate each
 * other's rows. Here we only rewrite the connection strings — a pure string
 * transform, no I/O — because this file must finish synchronously before the
 * pool and Prisma client are first imported. Creating and migrating the database
 * is async work; it happens once per worker in `setup-isolation.ts`.
 *
 * The pool reads TEST_DATABASE_URL (NODE_ENV==="test"); Prisma reads
 * DATABASE_URL. We override both with the per-worker URL so the two stay in
 * lock-step on the same private database.
 */
if (process.env.TEST_DATABASE_URL) {
  // Keep the original shared URL around so the bootstrap in `setup-isolation.ts`
  // can reach the `postgres` maintenance database to CREATE the per-worker one.
  process.env.BASE_TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

  const perWorkerUrl = workerDatabaseUrl(process.env.TEST_DATABASE_URL);
  process.env.TEST_DATABASE_URL = perWorkerUrl;
  process.env.DATABASE_URL = perWorkerUrl;
}
