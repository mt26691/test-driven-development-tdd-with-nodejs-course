import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { UrlService } from "../src/services/url.service";

describe("GET /urls/:code/stats", () => {
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

  it("returns 200 with the metadata for a known code", async () => {
    await store.save("abc123", "https://dalabs.academy");

    const response = await app.inject({
      method: "GET",
      url: "/urls/abc123/stats",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      shortCode: "abc123",
      originalUrl: "https://dalabs.academy",
      clicks: 0,
      createdAt: expect.any(String),
      shortUrl: "http://localhost:3000/abc123",
    });
  });

  it("serializes createdAt as an ISO 8601 string", async () => {
    await store.save("iso999", "https://example.com");

    const response = await app.inject({
      method: "GET",
      url: "/urls/iso999/stats",
    });

    const { createdAt } = response.json();
    expect(createdAt).toBe(new Date(createdAt).toISOString());
  });

  it("reflects the recorded click count", async () => {
    await store.save("hit500", "https://example.com");
    await store.incrementClicks("hit500");
    await store.incrementClicks("hit500");

    const response = await app.inject({
      method: "GET",
      url: "/urls/hit500/stats",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().clicks).toBe(2);
  });

  it("returns 404 for an unknown code", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/urls/nope404/stats",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Not Found");
  });

  it("returns stats, not a redirect or the list, for /urls/:code/stats", async () => {
    await store.save("abc123", "https://dalabs.academy");

    const response = await app.inject({
      method: "GET",
      url: "/urls/abc123/stats",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers.location).toBeUndefined();
    expect(Array.isArray(response.json().data)).toBe(false);
    expect(response.json().shortCode).toBe("abc123");
  });
});
