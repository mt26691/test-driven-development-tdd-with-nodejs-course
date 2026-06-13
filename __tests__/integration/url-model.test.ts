import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

/**
 * Integration test for the Prisma-managed `Url` model.
 *
 * This is the Red driver for the Prisma chapter. It uses the *typed* Prisma
 * client to create a `Url` row and read it back, asserting the persisted shape:
 *
 *   - `shortCode` and `originalUrl` round-trip exactly as written;
 *   - `clicks` defaults to 0 (we never set it on create);
 *   - `id` and `createdAt` are populated by the database;
 *   - the `@unique` constraint on `shortCode` rejects a duplicate.
 *
 * On the START branch this fails before a single assertion runs: there is no
 * `src/db/prisma` module, no generated client, and no `urls` table — Prisma is
 * not even installed. With the Postgres container up, that red is honest: it is
 * the *missing schema/client/table*, not a connectivity problem.
 *
 * On the FINISH branch, with the migration applied to the test database and the
 * client generated, every assertion below passes. The app itself still serves
 * requests from the in-memory Map — wiring this table into the routes is the
 * next chapter. Here we only prove the schema, migration, and typed client are
 * real by talking to the database directly through Prisma.
 */
describe("Url model (Prisma)", () => {
  afterAll(async () => {
    // Close both connection pools so Jest can exit cleanly instead of hanging
    // on an open socket. This suite talks to the database two ways: through the
    // Prisma client (the assertions below) and, indirectly, through the `pg`
    // pool that the centralized `beforeEach(truncateAllTables)` uses to reset
    // the tables. Both must be disconnected.
    await prisma.$disconnect();
    await pool.end();
  });

  it("creates a Url and reads back the persisted fields", async () => {
    const created = await prisma.url.create({
      data: {
        shortCode: "abc123",
        originalUrl: "https://example.com/some/very/long/path",
      },
    });

    expect(created.id).toEqual(expect.any(Number));
    expect(created.shortCode).toBe("abc123");
    expect(created.originalUrl).toBe("https://example.com/some/very/long/path");
    // We never set `clicks`, so the column default (0) must apply.
    expect(created.clicks).toBe(0);
    expect(created.createdAt).toBeInstanceOf(Date);

    // Read it back through a fresh query to prove it was actually persisted.
    const found = await prisma.url.findUnique({
      where: { shortCode: "abc123" },
    });

    expect(found).not.toBeNull();
    expect(found?.originalUrl).toBe(
      "https://example.com/some/very/long/path"
    );
    expect(found?.clicks).toBe(0);
  });

  it("rejects a duplicate shortCode (unique constraint)", async () => {
    await prisma.url.create({
      data: { shortCode: "dup", originalUrl: "https://example.com/first" },
    });

    // The same code a second time must violate the @unique constraint.
    await expect(
      prisma.url.create({
        data: { shortCode: "dup", originalUrl: "https://example.com/second" },
      })
    ).rejects.toThrow();
  });
});
