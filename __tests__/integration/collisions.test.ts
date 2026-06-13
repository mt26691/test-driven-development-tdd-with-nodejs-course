import { ConflictError } from "../../src/errors";
import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

/**
 * Integration tests for collision-safe short-code generation against real
 * Postgres. The unit suite proves the retry loop with the in-memory store; here
 * we prove it against the actual `urls.short_code` unique index — the constraint
 * the whole strategy leans on.
 *
 * `codes` builds a generator that returns a fixed sequence of candidate codes,
 * one per call, so we control exactly which inserts collide.
 */
const codes = (values: string[]): (() => string) => {
  let index = 0;
  return () => values[index++];
};

describe("collision-safe short-code generation (Prisma)", () => {
  let repository: PrismaUrlRepository;

  beforeEach(() => {
    repository = new PrismaUrlRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  describe("saveWithUniqueCode — retry on conflict", () => {
    it("retries past a code that already exists in the database", async () => {
      // Seed a row so the first generated candidate collides on insert.
      await repository.save("taken1", "https://existing.example");

      const code = await repository.saveWithUniqueCode(
        "https://dalabs.academy",
        codes(["taken1", "free22"])
      );

      expect(code).toBe("free22");

      const row = await prisma.url.findUnique({ where: { shortCode: code } });
      expect(row?.originalUrl).toBe("https://dalabs.academy");

      // The pre-existing row is untouched — no lost write.
      const seeded = await prisma.url.findUnique({
        where: { shortCode: "taken1" },
      });
      expect(seeded?.originalUrl).toBe("https://existing.example");
    });

    it("throws ConflictError when every attempt hits the unique constraint", async () => {
      await repository.save("dupe00", "https://existing.example");

      await expect(
        repository.saveWithUniqueCode(
          "https://dalabs.academy",
          codes(["dupe00", "dupe00", "dupe00"]),
          3
        )
      ).rejects.toBeInstanceOf(ConflictError);

      // Nothing extra was written.
      const total = await prisma.url.count();
      expect(total).toBe(1);
    });
  });

  describe("concurrency — N parallel requests, no duplicates, no lost writes", () => {
    it("assigns a distinct code to every concurrent insert", async () => {
      const N = 50;

      // Each call generates its own random code; fire them all at once against
      // the real database with Promise.all so they genuinely race.
      const results = await Promise.all(
        Array.from({ length: N }, (_, i) =>
          repository.saveWithUniqueCode(`https://dalabs.academy/${i}`, () =>
            Math.random().toString(36).slice(2, 8)
          )
        )
      );

      // Every request resolved to a code, and all codes are distinct.
      const unique = new Set(results);
      expect(unique.size).toBe(N);

      // Every successful insert produced exactly one row — no lost writes.
      const total = await prisma.url.count();
      expect(total).toBe(N);
    });

    it("resolves a guaranteed collision when two requests want the same first code", async () => {
      // Both requests draw "shared" first; one wins the insert, the other hits
      // the unique constraint and retries onto "altern".
      const first = repository.saveWithUniqueCode(
        "https://dalabs.academy/a",
        codes(["shared", "alterA"])
      );
      const second = repository.saveWithUniqueCode(
        "https://dalabs.academy/b",
        codes(["shared", "alterB"])
      );

      const [codeA, codeB] = await Promise.all([first, second]);

      expect(codeA).not.toBe(codeB);

      // Exactly two rows exist and "shared" is one of them (whichever won).
      const total = await prisma.url.count();
      expect(total).toBe(2);
      const shared = await prisma.url.findUnique({
        where: { shortCode: "shared" },
      });
      expect(shared).not.toBeNull();
    });
  });

  describe("saveWithAdvisoryLock — pessimistic alternative", () => {
    it("serializes generation and still assigns distinct codes under load", async () => {
      const N = 20;

      const results = await Promise.all(
        Array.from({ length: N }, (_, i) =>
          repository.saveWithAdvisoryLock(`https://dalabs.academy/lock/${i}`, () =>
            Math.random().toString(36).slice(2, 8)
          )
        )
      );

      const unique = new Set(results);
      expect(unique.size).toBe(N);

      const total = await prisma.url.count();
      expect(total).toBe(N);
    });
  });
});
