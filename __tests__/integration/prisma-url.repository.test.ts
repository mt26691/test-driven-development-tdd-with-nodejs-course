import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

/**
 * Integration test for the Prisma-backed {@link UrlStore} implementation.
 *
 * This is the Red driver for the database-migration chapter. The whole point of
 * the chapter is to retire the in-memory Map and serve from PostgreSQL — but the
 * route must not care which backend it talks to. It depends only on the
 * `UrlStore` interface from chapter 6 (`save` / `findByCode`), so any object
 * satisfying that contract is a drop-in replacement.
 *
 * `PrismaUrlRepository` is that drop-in: it implements the *same* interface,
 * backed by the real `urls` table through Prisma. Here we exercise it directly,
 * against a real database, asserting the contract round-trips:
 *
 *   - `save(shortCode, url)` persists a row, and `findByCode(shortCode)` returns
 *     the original URL back;
 *   - `findByCode` for an unknown code returns `undefined` (not a thrown error),
 *     matching the in-memory store's contract exactly;
 *   - the persisted row carries the database defaults — `clicks` starts at 0.
 *
 * On the START branch this fails to even compile: `src/services/prisma-url.repository`
 * does not exist yet. With the Postgres container up, that red is honest — it is
 * the *missing repository module*, not a connectivity problem (the sibling
 * `url-model.test.ts` still talks to the same database happily).
 *
 * Note this is an INTEGRATION test (Docker-required, `npm run test:integration`).
 * The fast unit suite (`npm test`) never touches Postgres: it exercises the route
 * with the in-memory `UrlService` injected, so it stays Docker-free and quick.
 */
describe("PrismaUrlRepository", () => {
  let repository: PrismaUrlRepository;

  beforeEach(() => {
    repository = new PrismaUrlRepository(prisma);
  });

  afterAll(async () => {
    // Close both connection pools so Jest can exit cleanly. The repository talks
    // to the database through the Prisma client; the centralized
    // `beforeEach(truncateAllTables)` resets the tables through the `pg` pool.
    // Both must be disconnected.
    await prisma.$disconnect();
    await pool.end();
  });

  it("saves a url and reads it back by its short code", async () => {
    await repository.save("abc123", "https://dalabs.academy");

    expect(await repository.findByCode("abc123")).toBe(
      "https://dalabs.academy"
    );
  });

  it("returns undefined for an unknown short code", async () => {
    expect(await repository.findByCode("does-not-exist")).toBeUndefined();
  });

  it("persists the row with the database defaults (clicks = 0)", async () => {
    await repository.save("xyz789", "https://example.com/path");

    const row = await prisma.url.findUnique({
      where: { shortCode: "xyz789" },
    });

    expect(row).not.toBeNull();
    expect(row?.originalUrl).toBe("https://example.com/path");
    expect(row?.clicks).toBe(0);
    expect(row?.createdAt).toBeInstanceOf(Date);
  });
});
