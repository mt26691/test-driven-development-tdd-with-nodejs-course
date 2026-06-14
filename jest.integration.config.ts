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
 * `setupFiles` (`setup-env.ts`) loads `.env` and rewrites the connection strings
 * to point this worker at its OWN database (`urlshortener_test_<id>`), before the
 * pool or Prisma client is imported.
 *
 * `setupFilesAfterEnv` (`setup-isolation.ts`) creates+migrates that per-worker
 * database once, then truncates it before each test.
 *
 * `maxWorkers: 4` runs the suite in PARALLEL across several workers. This is now
 * safe — and faster — because each worker is fully isolated on its own database,
 * so no worker can see or truncate another's rows. (The previous chapter had to
 * pin `maxWorkers: 1` to stay correct on a single shared database.)
 */
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__/integration"],
  globalSetup: "<rootDir>/__tests__/integration/global-setup.ts",
  setupFiles: ["<rootDir>/__tests__/integration/setup-env.ts"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/integration/setup-isolation.ts"],
  testMatch: ["<rootDir>/__tests__/integration/**/*.test.ts"],
  maxWorkers: 4,
};

export default config;
