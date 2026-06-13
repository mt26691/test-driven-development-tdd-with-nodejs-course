import { pool } from "../../src/db/pool";
import {
  createUrlsDemoTable,
  insertDemoUrl,
  countDemoUrls,
} from "./helpers/urls-demo";

/**
 * The flaky-test failure mode, demonstrated against a *real* database.
 *
 * Both tests do the exact same thing: insert exactly one row, then assert the
 * table holds exactly one row. Read in isolation, each is obviously correct.
 *
 * But they share one real test database, and on this (start) branch NOTHING
 * cleans up between them. So the first test inserts a row and passes; the
 * second test inserts another and now sees TWO rows — its `toBe(1)` fails.
 *
 * That is the whole lesson: the moment a real database is shared across tests,
 * state leaks from one test into the next. The suite becomes order-dependent
 * and flaky — each test passes when run alone, yet they fail when run together.
 * The finish branch fixes this by truncating the database before every test.
 */
describe("urls_demo isolation (no cleanup — leaks between tests)", () => {
  beforeAll(async () => {
    await createUrlsDemoTable();
  });

  afterAll(async () => {
    // Close the pool so Jest exits cleanly instead of hanging on the socket.
    await pool.end();
  });

  it("first insert leaves exactly one row", async () => {
    await insertDemoUrl("https://example.com/first");

    expect(await countDemoUrls()).toBe(1);
  });

  it("second insert also expects exactly one row (but sees the leftover)", async () => {
    await insertDemoUrl("https://example.com/second");

    expect(await countDemoUrls()).toBe(1);
  });
});
