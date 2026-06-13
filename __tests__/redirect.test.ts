import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { UrlService } from "../src/services/url.service";

describe("GET /:code", () => {
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

  it("redirects a known code to its original URL with 302 + Location", async () => {
    await store.save("abc123", "https://dalabs.academy");

    const response = await app.inject({ method: "GET", url: "/abc123" });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("https://dalabs.academy");
  });

  it("returns 404 for an unknown code and sets no Location header", async () => {
    const response = await app.inject({ method: "GET", url: "/nope404" });

    expect(response.statusCode).toBe(404);
    expect(response.headers.location).toBeUndefined();
    expect(response.json().error).toBe("Not Found");
  });

  it("does not swallow the reserved /health path", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.headers.location).toBeUndefined();
    expect(response.json()).toEqual({ message: "hello" });
  });
});
