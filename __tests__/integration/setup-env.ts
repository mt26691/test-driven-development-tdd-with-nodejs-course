import { config } from "dotenv";

/**
 * Jest `setupFiles` entry for the integration suite.
 *
 * It runs once per worker, before any test module is imported, and loads the
 * variables from `.env` into `process.env`. That is what lets `src/db/pool`
 * read TEST_DATABASE_URL when it is first imported. Jest already sets
 * NODE_ENV="test", so the pool automatically targets the test database.
 *
 * `quiet: true` suppresses dotenv's start-up banner so the test output stays
 * clean.
 */
config({ quiet: true });

/**
 * Point Prisma at the *test* database.
 *
 * The `pg` pool chooses dev-vs-test itself based on NODE_ENV, but Prisma's
 * `datasource` always reads the single env var `DATABASE_URL` (see
 * prisma/schema.prisma). So for tests we override `DATABASE_URL` with
 * `TEST_DATABASE_URL` before the Prisma client is imported. This must run
 * before `src/db/prisma` is first required — which it does, because
 * `setupFiles` executes ahead of every test module. The result: the same
 * Prisma client targets dev normally and the dedicated test database under
 * Jest, with no code change in the client itself.
 */
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
