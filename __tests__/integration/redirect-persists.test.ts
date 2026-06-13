import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

describe("GET /:code redirects from the database", () => {
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

  it("redirects a persisted short code to its original URL", async () => {
    const url = "https://dalabs.academy/courses/test-driven-development-with-nodejs";

    const created = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url },
    });
    const { shortCode } = created.json();

    const response = await app.inject({ method: "GET", url: `/${shortCode}` });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(url);
  });

  it("returns 404 for a code that is not in the database", async () => {
    const response = await app.inject({ method: "GET", url: "/missing" });

    expect(response.statusCode).toBe(404);
    expect(response.headers.location).toBeUndefined();
  });
});
