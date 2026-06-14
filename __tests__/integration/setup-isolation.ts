import { ensureWorkerDatabase } from "./helpers/worker-database";
import { truncateAllTables } from "./helpers/truncate";

/**
 * Per-worker isolation for the integration suite, wired via `setupFilesAfterEnv`.
 *
 * Two things happen here, in order:
 *
 * 1. `beforeAll` — ONCE per worker — creates this worker's own database
 *    (`urlshortener_test_<id>`) if it is missing and applies the migrations to
 *    it. The `globalThis` flag makes it run only the first time in each worker
 *    process: `setupFilesAfterEnv` re-runs for every test FILE, but the flag (a
 *    process-level global) survives across files in the same worker, so the
 *    create+migrate happens exactly once. `setup-env.ts` has already pointed the
 *    pool and Prisma at this worker's URL, so every query in the worker now
 *    targets its private database.
 *
 * 2. `beforeEach` — truncates that private database before each test (the
 *    chapter-10 clean-state foundation). Because the database is private, this
 *    truncate can never wipe another worker's rows — which is exactly what made
 *    the shared-database suite unsafe to run in parallel.
 */

const BOOTSTRAP_FLAG = Symbol.for("url-shortener.worker-db-ready");

beforeAll(async () => {
  const globals = globalThis as Record<symbol, Promise<string> | undefined>;
  const baseUrl = process.env.BASE_TEST_DATABASE_URL;

  if (!baseUrl) {
    throw new Error(
      "Missing BASE_TEST_DATABASE_URL. It is derived from TEST_DATABASE_URL in setup-env.ts."
    );
  }

  globals[BOOTSTRAP_FLAG] ??= ensureWorkerDatabase(baseUrl);
  await globals[BOOTSTRAP_FLAG];
});

beforeEach(async () => {
  await truncateAllTables();
});
