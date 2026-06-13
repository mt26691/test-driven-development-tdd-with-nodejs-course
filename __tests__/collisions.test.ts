import { ConflictError } from "../src/errors";
import { UrlService } from "../src/services/url.service";

/**
 * Unit tests for retry-on-conflict short-code generation.
 *
 * These run against the in-memory UrlService, which models the database unique
 * constraint by rejecting a second insert of the same code. That lets us drive
 * the retry loop deterministically without Docker — the integration suite proves
 * the same behaviour against real Postgres.
 *
 * `codes` builds a generator that hands back a fixed sequence of candidate
 * codes, one per call, so we control exactly which inserts collide.
 */
const codes = (values: string[]): (() => string) => {
  let index = 0;
  return () => values[index++];
};

describe("saveWithUniqueCode (retry on conflict)", () => {
  it("returns the first code when it does not collide", async () => {
    const store = new UrlService();

    const code = await store.saveWithUniqueCode(
      "https://dalabs.academy",
      codes(["aaaaaa"])
    );

    expect(code).toBe("aaaaaa");
    expect(await store.findByCode("aaaaaa")).toBe("https://dalabs.academy");
  });

  it("retries with a fresh code when the first candidate already exists", async () => {
    const store = new UrlService();
    await store.save("taken1", "https://existing.example");

    // First candidate collides with the seeded row; the second is free.
    const code = await store.saveWithUniqueCode(
      "https://dalabs.academy",
      codes(["taken1", "free22"])
    );

    expect(code).toBe("free22");
    expect(await store.findByCode("free22")).toBe("https://dalabs.academy");
    // The collision must not have overwritten the existing row.
    expect(await store.findByCode("taken1")).toBe("https://existing.example");
  });

  it("throws ConflictError after exhausting maxAttempts of collisions", async () => {
    const store = new UrlService();
    await store.save("dupe00", "https://existing.example");

    // Every candidate is the already-taken code, so every attempt collides.
    const generate = codes(["dupe00", "dupe00", "dupe00"]);

    await expect(
      store.saveWithUniqueCode("https://dalabs.academy", generate, 3)
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects a duplicate insert through the bare save method", async () => {
    const store = new UrlService();
    await store.save("once11", "https://first.example");

    await expect(
      store.save("once11", "https://second.example")
    ).rejects.toThrow();
    // The original row is untouched.
    expect(await store.findByCode("once11")).toBe("https://first.example");
  });
});
