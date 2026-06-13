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
 * The `Url` table now exists (Prisma migration), so this actually empties data
 * between tests. It discovers tables dynamically, so it picks up `urls`
 * automatically — and any table a future chapter adds — without edits here.
 *
 * One table is deliberately excluded: `_prisma_migrations`. That is Prisma's
 * own bookkeeping table recording which migrations have been applied. The
 * migrations are applied ONCE per run (in `global-setup.ts`); truncating this
 * table between tests would erase that history and convince Prisma the database
 * is un-migrated. So we filter it out of the discovery query below.
 */

/**
 * List the user tables in the `public` schema that the tests may truncate.
 *
 * Excludes Postgres internals (via `schemaname = 'public'`) and Prisma's
 * `_prisma_migrations` bookkeeping table, which must survive between tests so
 * the applied-migration history stays intact.
 */
export const getPublicTableNames = async (): Promise<string[]> => {
  const result = await pool.query<{ tablename: string }>(
    `SELECT tablename
       FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename <> '_prisma_migrations'`
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
