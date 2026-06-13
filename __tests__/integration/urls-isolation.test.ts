import { pool } from "../../src/db/pool";
import {
  createUrlsDemoTable,
  insertDemoUrl,
  countDemoUrls,
} from "./helpers/urls-demo";

/**
 * The same two tests that failed on the start branch — now passing, unchanged.
 *
 * Both tests insert exactly one row and assert the table holds exactly one row.
 * On the start branch the second test saw the first test's leftover row and
 * failed, because nothing reset the shared database between tests.
 *
 * Notice that NEITHER test cleans up after itself. The fix lives entirely in
 * `setup-isolation.ts`, wired through `setupFilesAfterEnv`: it registers a
 * single `beforeEach` that truncates every table before each test runs. So
 * each test starts from an empty `urls_demo`, inserts its one row, and sees
 * exactly one row — in any order, and individually. That is the value of
 * centralizing cleanup: tests stay focused on their own behaviour and can no
 * longer leak state into each other.
 */
describe("urls_demo isolation (centralized cleanup keeps tests independent)", () => {
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

  it("second insert also leaves exactly one row", async () => {
    await insertDemoUrl("https://example.com/second");

    expect(await countDemoUrls()).toBe(1);
  });
});
