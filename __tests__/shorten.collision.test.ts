import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { RandomSource } from "../src/utils/short-code";
import { UrlService } from "../src/services/url.service";

/**
 * Route-level collision tests.
 *
 * We force a collision by injecting the randomness source so the generator
 * produces a code that ALREADY exists in the store, then assert the request path
 * recovers: it retries with a fresh code and still returns 201, and only gives up
 * with 409 when every attempt collides.
 *
 * `randomFor` turns one or more target codes into a `RandomSource`. Each code is
 * expanded into the six [0,1) fractions whose floor*62 indices reproduce it, so
 * `generateShortCode` deterministically yields exactly that code on the next six
 * draws — the seam that lets a unit test choose which code the generator picks.
 */
const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const randomFor = (...targetCodes: string[]): RandomSource => {
  const fractions: number[] = [];
  for (const code of targetCodes) {
    for (const char of code) {
      // (index + 0.5) / 62 floors back to `index`, reproducing this character.
      fractions.push((ALPHABET.indexOf(char) + 0.5) / ALPHABET.length);
    }
  }

  let i = 0;
  return () => fractions[i++ % fractions.length];
};

describe("POST /shorten under a forced collision", () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app.close();
  });

  it("retries past a colliding code and still returns 201", async () => {
    const store = new UrlService();
    await store.save("AAAAAA", "https://taken.example");

    // First candidate is the taken "AAAAAA" (collision), second is "BBBBBB".
    app = await buildApp({
      logger: false,
      urlStore: store,
      random: randomFor("AAAAAA", "BBBBBB"),
    });
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url: "https://dalabs.academy" },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().shortCode).toBe("BBBBBB");
  });

  it("returns 409 when every generated code collides", async () => {
    const store = new UrlService();
    await store.save("CCCCCC", "https://taken.example");

    // The generator only ever produces the already-taken code, so every retry
    // collides and the store gives up with a ConflictError → 409.
    app = await buildApp({
      logger: false,
      urlStore: store,
      random: randomFor("CCCCCC"),
    });
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url: "https://dalabs.academy" },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("Conflict");
  });
});
