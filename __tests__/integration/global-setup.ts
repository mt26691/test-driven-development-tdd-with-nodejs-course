import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { config } from "dotenv";

/**
 * Jest `globalSetup` for the integration suite — runs ONCE, before any test
 * worker starts.
 *
 * The integration tests talk to a real database through Prisma, so that
 * database needs the `urls` table to exist before the first test runs. We make
 * that guarantee here by applying the committed migrations to the *test*
 * database with `prisma migrate deploy`.
 *
 * Why `migrate deploy` and not `migrate dev`? `deploy` is the non-interactive,
 * production-style command: it applies every pending migration in
 * `prisma/migrations/` exactly as written and never tries to generate new ones
 * or reset the database. That is precisely what a test database (and a CI
 * pipeline) wants — apply the known migrations, nothing more.
 *
 * Prisma's `datasource` reads the connection string from `DATABASE_URL`, but in
 * tests we want the *test* database. So we load `.env` and point `DATABASE_URL`
 * at `TEST_DATABASE_URL` just for this command. `setup-env.ts` does the same for
 * the test processes themselves, so both the migration here and the queries in
 * the tests target the same dedicated test database.
 */
export default async function globalSetup(): Promise<void> {
  config({ quiet: true });

  // Clear the on-disk barrier the parallel-safety demo uses so each run starts
  // fresh (a stale barrier from a previous run would let the workers skip the
  // wait and miss the race).
  rmSync(join(tmpdir(), "url-shortener-parallel-safety"), { recursive: true, force: true });

  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  if (!testDatabaseUrl) {
    throw new Error(
      "Missing TEST_DATABASE_URL. Copy .env.example to .env and start Postgres with `docker compose up -d`."
    );
  }

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  });
}
