import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

describe("GET /urls/:code/stats against the database", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const store = new PrismaUrlRepository(prisma);
    app = await buildApp({ logger: false, urlStore: store });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it("returns the stored metadata for a known code", async () => {
    await prisma.url.create({
      data: { shortCode: "stat01", originalUrl: "https://dalabs.academy" },
    });

    const response = await app.inject({
      method: "GET",
      url: "/urls/stat01/stats",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.shortCode).toBe("stat01");
    expect(body.originalUrl).toBe("https://dalabs.academy");
    expect(body.clicks).toBe(0);
    expect(body.shortUrl).toBe("http://localhost:3000/stat01");
    expect(body.createdAt).toBe(new Date(body.createdAt).toISOString());
  });

  it("reflects the click count after redirects", async () => {
    const code = (
      await app.inject({
        method: "POST",
        url: "/shorten",
        payload: { url: "https://example.com" },
      })
    ).json().shortCode as string;

    await app.inject({ method: "GET", url: `/${code}` });
    await app.inject({ method: "GET", url: `/${code}` });
    await app.inject({ method: "GET", url: `/${code}` });

    const response = await app.inject({
      method: "GET",
      url: `/urls/${code}/stats`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().clicks).toBe(3);
  });

  it("returns 404 for an unknown code", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/urls/missing/stats",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Not Found");
  });
});
