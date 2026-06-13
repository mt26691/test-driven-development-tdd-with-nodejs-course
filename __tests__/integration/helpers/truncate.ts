import { pool } from "../../../src/db/pool";

/**
 * Test-only cleanup helper — a stepping stone toward real test isolation.
 *
 * The moment tests share a *real* database, they also share its state: one
 * test's rows are visible to the next, so order suddenly matters and the suite
 * gets flaky. The fix is to reset the database between tests. This helper is
 * the seam for that: it TRUNCATEs every table in the `public` schema so each
 * test can start from a clean slate.
 *
 * Right now there are no application tables yet — the `Url` table arrives with
 * Prisma in a later chapter — so calling this is effectively a no-op. That is
 * fine: the point of this chapter is to stand up the database and prove
 * connectivity, and to put the cleanup seam in place. The dedicated
 * test-isolation chapter hardens this (e.g. wiring it into a `beforeEach`,
 * choosing truncate-vs-transaction, and making it parallel-safe).
 */

/** List the user tables in the `public` schema (excludes Postgres internals). */
export const getPublicTableNames = async (): Promise<string[]> => {
  const result = await pool.query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
  );

  return result.rows.map((row) => row.tablename);
};

/**
 * Empty every table in the `public` schema.
 *
 * `RESTART IDENTITY` resets serial/identity counters so IDs are predictable
 * between runs; `CASCADE` follows foreign keys so the order we truncate in
 * does not matter. If there are no tables yet, this returns without running a
 * destructive statement.
 */
export const truncateAllTables = async (): Promise<void> => {
  const tables = await getPublicTableNames();

  if (tables.length === 0) {
    return;
  }

  const quoted = tables.map((name) => `"${name}"`).join(", ");

  await pool.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
};
