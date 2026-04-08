import { urlStore } from "../src/store";
import { shortenUrl } from "../src/services/url.service";

describe("shortenUrl", () => {
  beforeEach(() => {
    urlStore.clear();
  });

  it("should return an entry with shortCode, url, and shortUrl", () => {
    const result = shortenUrl("https://example.com");

    expect(result.shortCode).toEqual(expect.any(String));
    expect(result.url).toBe("https://example.com");
    expect(result.shortUrl).toBe(`http://localhost:3000/${result.shortCode}`);
  });

  it("should store the entry in the store", () => {
    const result = shortenUrl("https://example.com");
    const stored = urlStore.findByShortCode(result.shortCode);

    expect(stored).toBeDefined();
    expect(stored!.url).toBe("https://example.com");
  });

  it("should return different short codes for different URLs", () => {
    const result1 = shortenUrl("https://example.com/a");
    const result2 = shortenUrl("https://example.com/b");

    expect(result1.shortCode).not.toBe(result2.shortCode);
  });
});
