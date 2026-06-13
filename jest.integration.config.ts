import type { Config } from "jest";

/**
 * Separate Jest config for the *integration* tests.
 *
 * The default `jest.config.ts` runs the fast, dependency-free unit tests under
 * `__tests__` and deliberately ignores `__tests__/integration`. Those tests
 * need a real PostgreSQL container running, so they get their own config and
 * their own npm script (`npm run test:integration`). Keeping the two suites
 * apart means the unit tests stay runnable any time, with no Docker required.
 */
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__/integration"],
};

export default config;
