import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

/**
 * End-to-end integration test: POST /shorten must actually write to Postgres.
 *
 * The unit suite proves the *route logic* with the in-memory store injected, but
 * it can never prove the request path persists to the real database — that is
 * exactly what changed in this chapter. So here we wire `buildApp` with the
 * Prisma-backed repository (the same store the app uses in production) and drive
 * a real HTTP request through `app.inject()`. Then we query the `urls` table
 * directly to confirm the row landed: same `shortCode`, the `originalUrl` we
 * posted, and the database default `clicks = 0`.
 *
 * On the START branch this fails to compile — neither `PrismaUrlRepository` nor
 * the `urlStore` injection option on `buildApp` exists yet. With the container
 * up, that red is the missing wiring, not a connectivity problem.
 */
describe("POST /shorten persists to the database", () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it("writes the shortened URL to the urls table", async () => {
    const store = new PrismaUrlRepository(prisma);
    app = await buildApp({ logger: false, urlStore: store, random: () => 0 });
    await app.ready();

    const url = "https://dalabs.academy/courses/test-driven-development-with-nodejs";

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.shortCode).toBe("000000");

    // The row must really exist in Postgres — not just in a Map.
    const row = await prisma.url.findUnique({
      where: { shortCode: body.shortCode },
    });

    expect(row).not.toBeNull();
    expect(row?.originalUrl).toBe(url);
    expect(row?.clicks).toBe(0);
  });
});
