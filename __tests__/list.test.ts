import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { UrlService } from "../src/services/url.service";

describe("GET /urls", () => {
  let app: FastifyInstance;
  let store: UrlService;

  beforeEach(async () => {
    store = new UrlService();
    app = await buildApp({ logger: false, urlStore: store });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  const seed = async (count: number): Promise<void> => {
    for (let i = 1; i <= count; i++) {
      await store.save(`code${i}`, `https://example.com/${i}`);
    }
  };

  it("returns an empty page with total 0 when there are no URLs", async () => {
    const response = await app.inject({ method: "GET", url: "/urls" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: [],
      page: 1,
      limit: 20,
      total: 0,
    });
  });

  it("returns every URL on one page with the default page size", async () => {
    await seed(3);

    const response = await app.inject({ method: "GET", url: "/urls" });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.page).toBe(1);
    expect(body.limit).toBe(20);
    expect(body.total).toBe(3);
    expect(body.data).toHaveLength(3);
  });

  it("orders results newest first and exposes each item's fields", async () => {
    await seed(2);

    const response = await app.inject({ method: "GET", url: "/urls" });

    const body = response.json();
    expect(body.data.map((u: { shortCode: string }) => u.shortCode)).toEqual([
      "code2",
      "code1",
    ]);
    expect(body.data[0]).toEqual({
      shortCode: "code2",
      originalUrl: "https://example.com/2",
      clicks: 0,
      createdAt: expect.any(String),
      shortUrl: "http://localhost:3000/code2",
    });
  });

  it("paginates: page 1 and page 2 return different slices, total stays constant", async () => {
    await seed(5);

    const page1 = await app.inject({ method: "GET", url: "/urls?page=1&limit=2" });
    const page2 = await app.inject({ method: "GET", url: "/urls?page=2&limit=2" });

    const b1 = page1.json();
    const b2 = page2.json();

    expect(b1.total).toBe(5);
    expect(b2.total).toBe(5);
    expect(b1.data.map((u: { shortCode: string }) => u.shortCode)).toEqual([
      "code5",
      "code4",
    ]);
    expect(b2.data.map((u: { shortCode: string }) => u.shortCode)).toEqual([
      "code3",
      "code2",
    ]);
  });

  it("returns the last partial page", async () => {
    await seed(5);

    const response = await app.inject({ method: "GET", url: "/urls?page=3&limit=2" });

    const body = response.json();
    expect(body.total).toBe(5);
    expect(body.data.map((u: { shortCode: string }) => u.shortCode)).toEqual([
      "code1",
    ]);
  });

  it("rejects a non-positive page with 400", async () => {
    const response = await app.inject({ method: "GET", url: "/urls?page=0" });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Bad Request");
  });

  it("rejects a negative limit with 400", async () => {
    const response = await app.inject({ method: "GET", url: "/urls?limit=-5" });

    expect(response.statusCode).toBe(400);
  });

  it("rejects a limit over the maximum with 400", async () => {
    const response = await app.inject({ method: "GET", url: "/urls?limit=101" });

    expect(response.statusCode).toBe(400);
  });

  it("does not let the /:code catch-all swallow /urls", async () => {
    await seed(1);

    const response = await app.inject({ method: "GET", url: "/urls" });

    expect(response.statusCode).toBe(200);
    expect(response.headers.location).toBeUndefined();
    expect(Array.isArray(response.json().data)).toBe(true);
  });
});
