import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { urlStore } from "../src/store";

describe("POST /shorten", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    urlStore.clear();
  });

  it("should return 201 with a short code and short URL", async () => {
    const url = "https://dalabs.academy/courses/test-driven-development-with-nodejs";

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.shortCode).toEqual(expect.any(String));
    expect(body.url).toBe(url);
    expect(body.shortUrl).toBe(`http://localhost:3000/${body.shortCode}`);
  });

  it("should return different short codes for different URLs", async () => {
    const response1 = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url: "https://example.com/first" },
    });

    const response2 = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url: "https://example.com/second" },
    });

    const body1 = response1.json();
    const body2 = response2.json();

    expect(body1.shortCode).not.toBe(body2.shortCode);
  });
});
