import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

/**
 * Integration test for click tracking on the redirect endpoint.
 *
 * This is the Red driver for chapter 14. The behaviour we want: every successful
 * `GET /:code` redirect increments the URL's `clicks` counter, so after N hits
 * the row's `clicks` equals N. We assert against the real database — POST a URL
 * via `/shorten`, GET `/:code` N times, then read `clicks` straight from the
 * `urls` table through Prisma — because that is the source of truth the next
 * chapters (stats, partitioning) read from.
 *
 * On the START branch the redirect handler never increments, so `clicks` stays
 * at its default 0 → Expected 5, Received 0. With the Postgres container up that
 * red is honest behaviour, not a connectivity problem.
 */
describe("click tracking on GET /:code", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const store = new PrismaUrlRepository(prisma);
    app = await buildApp({ logger: false, urlStore: store, random: () => 0 });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  const shortenAndGetCode = async (url: string): Promise<string> => {
    const created = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url },
    });
    return created.json().shortCode as string;
  };

  it("starts a freshly shortened URL at zero clicks", async () => {
    const shortCode = await shortenAndGetCode("https://dalabs.academy");

    const row = await prisma.url.findUnique({ where: { shortCode } });

    expect(row?.clicks).toBe(0);
  });

  it("records N clicks after N successful redirects", async () => {
    const shortCode = await shortenAndGetCode("https://dalabs.academy");

    const N = 5;
    for (let i = 0; i < N; i++) {
      const response = await app.inject({ method: "GET", url: `/${shortCode}` });
      expect(response.statusCode).toBe(302);
    }

    const row = await prisma.url.findUnique({ where: { shortCode } });

    expect(row?.clicks).toBe(N);
  });

  it("does not increment clicks for an unknown code (404)", async () => {
    const response = await app.inject({ method: "GET", url: "/missing" });

    expect(response.statusCode).toBe(404);

    const row = await prisma.url.findUnique({ where: { shortCode: "missing" } });
    expect(row).toBeNull();
  });
});
