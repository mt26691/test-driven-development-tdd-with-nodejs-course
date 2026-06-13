import {
  ALLOWED_PROTOCOLS,
  MAX_URL_LENGTH,
  isValidHttpUrl,
} from "../src/utils/validate-url";

/**
 * Unit tests for the pure URL validator.
 *
 * The route delegates its "is this a real http(s) URL?" decision to this
 * function, so testing the edge cases here — directly, without spinning up
 * Fastify — keeps the route tests focused on HTTP wiring and status codes.
 */
describe("isValidHttpUrl", () => {
  it("accepts a plain https url", () => {
    expect(isValidHttpUrl("https://dalabs.academy")).toBe(true);
  });

  it("accepts an http url with a path and query string", () => {
    expect(isValidHttpUrl("http://example.com/path?query=1")).toBe(true);
  });

  it("rejects a value that is not a string", () => {
    expect(isValidHttpUrl(12345)).toBe(false);
    expect(isValidHttpUrl(null)).toBe(false);
    expect(isValidHttpUrl(undefined)).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidHttpUrl("")).toBe(false);
  });

  it("rejects the ftp protocol", () => {
    expect(isValidHttpUrl("ftp://files.example.com/report.pdf")).toBe(false);
  });

  it("rejects the javascript protocol", () => {
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects the mailto and file protocols", () => {
    expect(isValidHttpUrl("mailto:hi@example.com")).toBe(false);
    expect(isValidHttpUrl("file:///etc/passwd")).toBe(false);
  });

  it("rejects a string that does not parse as a URL", () => {
    expect(isValidHttpUrl("not a url")).toBe(false);
  });

  it("accepts a url exactly at the maximum length", () => {
    const base = "https://example.com/";
    const atLimit = base + "a".repeat(MAX_URL_LENGTH - base.length);

    expect(atLimit).toHaveLength(MAX_URL_LENGTH);
    expect(isValidHttpUrl(atLimit)).toBe(true);
  });

  it("rejects a url one character over the maximum length", () => {
    const overLimit = "https://example.com/" + "a".repeat(MAX_URL_LENGTH);

    expect(overLimit.length).toBeGreaterThan(MAX_URL_LENGTH);
    expect(isValidHttpUrl(overLimit)).toBe(false);
  });

  it("only allows the http and https protocols", () => {
    expect(ALLOWED_PROTOCOLS).toEqual(["http:", "https:"]);
  });
});
