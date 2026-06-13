import { FastifyInstance } from "fastify";
import type { Response as InjectResponse } from "light-my-request";
import { buildApp } from "../src/app";
import { UrlService } from "../src/services/url.service";

/**
 * Validation tests for POST /shorten — the UNHAPPY PATH FIRST.
 *
 * Before we let a URL anywhere near the store, the endpoint must reject input
 * that is missing, the wrong type, empty, too long, or not a real http(s) URL.
 * Every rejection returns 400 with the SAME error body shape:
 *
 *   { error: string, message: string }
 *
 * Keeping one shape means an API consumer parses errors the same way regardless
 * of which rule was violated.
 */
describe("POST /shorten — input validation", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Inject the in-memory store so the happy-path cases (201) never touch a
    // database — these validation tests stay fast and Docker-free.
    app = await buildApp({ logger: false, urlStore: new UrlService() });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  const post = (payload: object): Promise<InjectResponse> =>
    app.inject({ method: "POST", url: "/shorten", payload });

  // Helper: assert the response is a 400 with our consistent error envelope.
  const expectBadRequest = (response: InjectResponse): void => {
    expect(response.statusCode).toBe(400);

    const body = response.json();
    expect(typeof body.error).toBe("string");
    expect(typeof body.message).toBe("string");
    expect(body.error).toBe("Bad Request");
  };

  it("rejects a request with no url field", async () => {
    const response = await post({});

    expectBadRequest(response);
  });

  it("rejects a url that is not a string", async () => {
    const response = await post({ url: 12345 });

    expectBadRequest(response);
  });

  it("rejects an empty url string", async () => {
    const response = await post({ url: "" });

    expectBadRequest(response);
  });

  it("rejects a url using the ftp:// protocol", async () => {
    const response = await post({ url: "ftp://files.example.com/report.pdf" });

    expectBadRequest(response);
  });

  it("rejects a url using the javascript: protocol", async () => {
    const response = await post({ url: "javascript:alert(1)" });

    expectBadRequest(response);
  });

  it("rejects a string that is not a URL at all", async () => {
    const response = await post({ url: "not a url" });

    expectBadRequest(response);
  });

  it("rejects a url that exceeds the maximum length", async () => {
    // 2049 characters — one past the 2048 limit the schema enforces.
    const tooLong = "https://example.com/" + "a".repeat(2048);
    const response = await post({ url: tooLong });

    expectBadRequest(response);
  });

  it("still accepts a valid https url", async () => {
    const response = await post({ url: "https://dalabs.academy" });

    expect(response.statusCode).toBe(201);
    expect(response.json().url).toBe("https://dalabs.academy");
  });

  it("still accepts a valid http url", async () => {
    const response = await post({ url: "http://example.com/path?query=1" });

    expect(response.statusCode).toBe(201);
    expect(response.json().url).toBe("http://example.com/path?query=1");
  });
});
