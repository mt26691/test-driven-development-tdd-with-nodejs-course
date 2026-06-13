import { pool } from "../../../src/db/pool";

/**
 * A tiny, test-only `urls_demo` table used purely to TEACH test isolation.
 *
 * The app still stores URLs in an in-memory Map — the real `Url` table arrives
 * with Prisma in a later chapter. But to demonstrate cross-test data leakage
 * *honestly*, we need rows that actually persist in a real database between
 * tests. So this chapter creates its own throwaway table directly via SQL.
 *
 * The name is deliberately `urls_demo` (not `urls` / `Url`) so it can never
 * collide with the Prisma-managed table introduced later: different name,
 * different lifecycle, created and owned entirely by the integration suite.
 */

/**
 * Create the demo table if it does not already exist.
 *
 * `CREATE TABLE IF NOT EXISTS` is idempotent, so a suite can call this in
 * `beforeAll` without worrying about whether a previous run left the table
 * behind. The table is intentionally minimal — an identity id and a url column
 * are all we need to insert rows and count them.
 */
export const createUrlsDemoTable = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS urls_demo (
      id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      url TEXT NOT NULL
    )
  `);
};

/** Insert one row into the demo table. */
export const insertDemoUrl = async (url: string): Promise<void> => {
  await pool.query("INSERT INTO urls_demo (url) VALUES ($1)", [url]);
};

/** Count the rows currently in the demo table. */
export const countDemoUrls = async (): Promise<number> => {
  const result = await pool.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM urls_demo"
  );

  // Postgres returns COUNT(*) as a string (bigint), so parse it to a number.
  return Number(result.rows[0].count);
};
