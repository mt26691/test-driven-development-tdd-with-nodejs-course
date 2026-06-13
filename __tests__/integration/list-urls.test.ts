import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

describe("GET /urls against the database", () => {
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

  const seed = async (count: number): Promise<void> => {
    for (let i = 1; i <= count; i++) {
      await prisma.url.create({
        data: { shortCode: `code${i}`, originalUrl: `https://example.com/${i}` },
      });
    }
  };

  it("returns an empty page with total 0 when the table is empty", async () => {
    const response = await app.inject({ method: "GET", url: "/urls" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: [], page: 1, limit: 20, total: 0 });
  });

  it("returns rows newest first with the total count", async () => {
    await seed(3);

    const response = await app.inject({ method: "GET", url: "/urls" });

    const body = response.json();
    expect(body.total).toBe(3);
    expect(body.data.map((u: { shortCode: string }) => u.shortCode)).toEqual([
      "code3",
      "code2",
      "code1",
    ]);
  });

  it("paginates with limit/offset and keeps total constant across pages", async () => {
    await seed(5);

    const page1 = await app.inject({ method: "GET", url: "/urls?page=1&limit=2" });
    const page2 = await app.inject({ method: "GET", url: "/urls?page=2&limit=2" });
    const page3 = await app.inject({ method: "GET", url: "/urls?page=3&limit=2" });

    expect(page1.json().data.map((u: { shortCode: string }) => u.shortCode)).toEqual([
      "code5",
      "code4",
    ]);
    expect(page2.json().data.map((u: { shortCode: string }) => u.shortCode)).toEqual([
      "code3",
      "code2",
    ]);
    expect(page3.json().data.map((u: { shortCode: string }) => u.shortCode)).toEqual([
      "code1",
    ]);
    expect(page1.json().total).toBe(5);
    expect(page3.json().total).toBe(5);
  });

  it("reflects click counts in the listed items", async () => {
    const code = (
      await app.inject({
        method: "POST",
        url: "/shorten",
        payload: { url: "https://dalabs.academy" },
      })
    ).json().shortCode as string;

    await app.inject({ method: "GET", url: `/${code}` });
    await app.inject({ method: "GET", url: `/${code}` });

    const response = await app.inject({ method: "GET", url: "/urls" });
    const item = response
      .json()
      .data.find((u: { shortCode: string }) => u.shortCode === code);

    expect(item.clicks).toBe(2);
  });
});
