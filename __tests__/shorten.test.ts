import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";

describe("POST /shorten", () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app.close();
  });

  it("should return 201 with a generated short code and short URL", async () => {
    // Inject a deterministic randomness source so the generated code is known.
    // random() === 0 maps to the first alphabet character for all six positions.
    app = await buildApp({ logger: false, random: () => 0 });
    await app.ready();

    const url =
      "https://dalabs.academy/courses/test-driven-development-with-nodejs";

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      shortCode: "000000",
      url,
      shortUrl: "http://localhost:3000/000000",
    });
  });

  it("returns a 6-character base62 code whose value flows into the short URL", async () => {
    app = await buildApp({ logger: false });
    await app.ready();

    const url = "https://dalabs.academy";

    const response = await app.inject({
      method: "POST",
      url: "/shorten",
      payload: { url },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.shortCode).toMatch(/^[0-9A-Za-z]{6}$/);
    expect(body.url).toBe(url);
    expect(body.shortUrl).toBe(`http://localhost:3000/${body.shortCode}`);
  });
});
