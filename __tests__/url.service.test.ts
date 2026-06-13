import { UrlService } from "../src/services/url.service";

describe("UrlService", () => {
  let service: UrlService;

  beforeEach(() => {
    service = new UrlService();
  });

  it("stores a url and returns it when looked up by its short code", async () => {
    await service.save("abc123", "https://dalabs.academy");

    expect(await service.findByCode("abc123")).toBe("https://dalabs.academy");
  });

  it("returns undefined for an unknown short code", async () => {
    expect(await service.findByCode("does-not-exist")).toBeUndefined();
  });

  it("overwrites the url when the same short code is saved twice", async () => {
    await service.save("abc123", "https://example.com");
    await service.save("abc123", "https://dalabs.academy");

    expect(await service.findByCode("abc123")).toBe("https://dalabs.academy");
  });
});
