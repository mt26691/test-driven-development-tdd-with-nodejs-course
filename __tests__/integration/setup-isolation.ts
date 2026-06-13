import { truncateAllTables } from "./helpers/truncate";

/**
 * Centralized test isolation for the integration suite.
 *
 * This file is wired into Jest via `setupFilesAfterEnv` in
 * `jest.integration.config.ts`. Unlike `setupFiles` (which runs before the test
 * framework exists), a `setupFilesAfterEnv` module runs *after* Jest has
 * installed `beforeEach`/`afterEach` into the global scope — so it can register
 * hooks that apply to every test in every integration file.
 *
 * The hook below truncates every table in the test database before each test.
 * That gives every integration test a clean, empty database to start from, no
 * matter what the previous test left behind. The payoff: tests stop leaking
 * state into each other, so they pass in any order and individually — the
 * order-dependent flakiness from the start branch is gone.
 *
 * Why `beforeEach` and not `afterEach`? Cleaning up *before* a test means a run
 * that crashes halfway (and skips its own cleanup) still can't poison the next
 * test — the next test wipes the slate first. It also leaves the final state
 * in the database after a run, which is handy when you want to inspect it.
 *
 * Why truncate rather than wrap each test in a transaction and roll back? See
 * the chapter discussion — truncate is simpler and works even when the code
 * under test manages its own transactions or connections. The transaction
 * strategy is faster but more invasive. Parallel safety (a separate database
 * per Jest worker) is a later, more advanced concern.
 */
beforeEach(async () => {
  await truncateAllTables();
});
