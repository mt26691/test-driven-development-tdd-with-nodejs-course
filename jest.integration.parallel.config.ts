import type { Config } from "jest";

/**
 * Demonstration config: the WHOLE integration suite run in parallel.
 *
 * It matches every integration spec — the regular `*.test.ts` files plus the two
 * `*.paralleltest.ts` contention drivers — and runs them across several workers
 * (`maxWorkers: 4`). On the start branch every worker shares ONE test database,
 * so the suites truncate and rewrite the same `urls` table at once and clobber
 * each other's rows: the run fails (flakily — it fails whenever Jest actually
 * spreads the suites across workers). On the finish branch each worker has its
 * own database, so the very same parallel run is green.
 *
 * The regular `npm run test:integration` (jest.integration.config.ts) matches
 * only `*.test.ts`, so the contention drivers never run there.
 */
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__/integration"],
  globalSetup: "<rootDir>/__tests__/integration/global-setup.ts",
  setupFiles: ["<rootDir>/__tests__/integration/setup-env.ts"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/integration/setup-isolation.ts"],
  testMatch: [
    "<rootDir>/__tests__/integration/**/*.test.ts",
    "<rootDir>/__tests__/integration/**/*.paralleltest.ts",
  ],
  maxWorkers: 4,
};

export default config;
