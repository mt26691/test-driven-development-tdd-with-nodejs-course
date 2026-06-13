import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

describe("DELETE /urls/:code against the database", () => {
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

  it("returns 204 and removes the row from the database", async () => {
    await prisma.url.create({
      data: { shortCode: "del001", originalUrl: "https://dalabs.academy" },
    });

    const response = await app.inject({
      method: "DELETE",
      url: "/urls/del001",
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");

    const row = await prisma.url.findUnique({
      where: { shortCode: "del001" },
    });
    expect(row).toBeNull();
  });

  it("makes a subsequent stats lookup return 404", async () => {
    await prisma.url.create({
      data: { shortCode: "del002", originalUrl: "https://example.com" },
    });

    await app.inject({ method: "DELETE", url: "/urls/del002" });

    const stats = await app.inject({
      method: "GET",
      url: "/urls/del002/stats",
    });
    expect(stats.statusCode).toBe(404);
  });

  it("returns 404 for an unknown code and leaves other rows untouched", async () => {
    await prisma.url.create({
      data: { shortCode: "keep01", originalUrl: "https://example.com/keep" },
    });

    const response = await app.inject({
      method: "DELETE",
      url: "/urls/missing",
    });

    expect(response.statusCode).toBe(404);

    const row = await prisma.url.findUnique({
      where: { shortCode: "keep01" },
    });
    expect(row).not.toBeNull();
  });
});
