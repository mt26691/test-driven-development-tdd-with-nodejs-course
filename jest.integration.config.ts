import type { Config } from "jest";

/**
 * Separate Jest config for the *integration* tests.
 *
 * The default `jest.config.ts` runs the fast, dependency-free unit tests under
 * `__tests__` and deliberately ignores `__tests__/integration`. Those tests
 * need a real PostgreSQL container running, so they get their own config and
 * their own npm script (`npm run test:integration`). Keeping the two suites
 * apart means the unit tests stay runnable any time, with no Docker required.
 *
 * `setupFiles` loads environment variables from `.env` (via dotenv) before any
 * test module is imported, so the connection pool can read TEST_DATABASE_URL.
 *
 * `setupFilesAfterEnv` wires the per-test isolation hook (truncate before each
 * test) through `setup-isolation.ts`.
 *
 * `globalSetup` runs ONCE before the whole suite and applies the Prisma
 * migrations to the test database (`prisma migrate deploy`) so the `urls` table
 * exists before the first test runs.
 *
 * `maxWorkers: 1` forces the suite to run SERIALLY, one test file at a time.
 * This is load-bearing: the whole suite shares ONE test database, so two workers
 * running in parallel would truncate and rewrite the same tables at the same
 * time — worker A's `beforeEach(truncateAllTables)` would wipe worker B's
 * just-inserted rows. Serial execution is the only thing keeping this correct
 * today, and it costs us the speed of the extra cores. The next chapter removes
 * this constraint by giving every worker its own database.
 */
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__/integration"],
  globalSetup: "<rootDir>/__tests__/integration/global-setup.ts",
  setupFiles: ["<rootDir>/__tests__/integration/setup-env.ts"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/integration/setup-isolation.ts"],
  testMatch: ["<rootDir>/__tests__/integration/**/*.test.ts"],
  maxWorkers: 1,
};

export default config;
