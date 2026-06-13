import { pool } from "../../src/db/pool";
import { truncateAllTables } from "./helpers/truncate";

/**
 * Integration test: prove we can talk to a *real* PostgreSQL database.
 *
 * Unlike the unit tests, this one needs an actual Postgres running — start it
 * with `docker compose up -d` (see docker-compose.yml). It connects to the
 * dedicated test database (TEST_DATABASE_URL) and runs the most trivial query
 * imaginable, `SELECT 1`. If that round-trips and comes back as `1`, the whole
 * connection stack — env config, the `pg` Pool, Docker networking — works.
 *
 * On the start branch this file fails to even compile: there is no
 * `src/db/pool` module yet and `pg` is not installed. That red is the point —
 * it drives us to stand up the database and the connection module.
 */
describe("database connectivity", () => {
  afterAll(async () => {
    // Close the pool so Jest can exit cleanly instead of hanging on an open
    // socket. Forgetting this is the classic "Jest did not exit" warning.
    await pool.end();
  });

  it("connects to Postgres and runs a trivial query", async () => {
    const result = await pool.query<{ result: number }>("SELECT 1 as result");

    expect(result.rows[0].result).toBe(1);
  });

  it("cleans up the test database without error (cleanup seam for ch10)", async () => {
    // There are no application tables yet, so this is effectively a no-op — but
    // proving the seam runs against the real DB sets up the dedicated
    // test-isolation chapter, where it moves into a beforeEach hook.
    await expect(truncateAllTables()).resolves.toBeUndefined();
  });
});
