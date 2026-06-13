import { config } from "dotenv";

/**
 * Jest `setupFiles` entry for the integration suite.
 *
 * It runs once, before any test module is imported, and loads the variables
 * from `.env` into `process.env`. That is what lets `src/db/pool` read
 * TEST_DATABASE_URL when it is first imported. Jest already sets
 * NODE_ENV="test", so the pool automatically targets the test database.
 *
 * `quiet: true` suppresses dotenv's start-up banner so the test output stays
 * clean.
 */
config({ quiet: true });
