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
 * `setupFilesAfterEach` is wrong — the per-test hook file is wired through
 * `setupFilesAfterEnv`, which runs after Jest installs `beforeEach`/`afterEach`
 * into the global scope. `setup-isolation.ts` uses that to register a single
 * `beforeEach` that truncates the test database before every integration test,
 * so tests can never leak state into one another.
 *
 * `globalSetup` runs ONCE before the whole suite (before any worker) and is the
 * right place for one-time, cross-test preparation. We use it to apply the
 * Prisma migrations to the test database (`prisma migrate deploy`) so the
 * `urls` table exists before the first test runs.
 */
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__/integration"],
  globalSetup: "<rootDir>/__tests__/integration/global-setup.ts",
  setupFiles: ["<rootDir>/__tests__/integration/setup-env.ts"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/integration/setup-isolation.ts"],
  // Only files ending in .test.ts are tests. Without this, Jest's default
  // pattern treats every .ts file under __tests__ as a test — including the
  // setup file and the helpers, which have no test cases.
  testMatch: ["<rootDir>/__tests__/integration/**/*.test.ts"],
};

export default config;
