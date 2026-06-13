import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  // The integration suite needs a real PostgreSQL container, so it lives under
  // __tests__/integration and runs via `npm run test:integration` with its own
  // config. Excluding it here keeps `npm test` fast and Docker-free.
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/__tests__/integration/"],
};

export default config;
