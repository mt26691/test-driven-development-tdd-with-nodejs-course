import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";

describe("POST /shorten", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 201 with a short code and short URL", async () => {
    const url = "https://dalabs.academy/courses/test-driven-development-with-nodejs";

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      shortCode: "abc123",
      url,
      shortUrl: "http://localhost:3000/abc123",
    });
  });
});
