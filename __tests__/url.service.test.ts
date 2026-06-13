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

  it("rejects a second save of an existing short code instead of overwriting", async () => {
    await service.save("abc123", "https://example.com");

    // The in-memory store now models the database unique constraint: a duplicate
    // code is rejected, not silently overwritten (which would be a lost write).
    await expect(
      service.save("abc123", "https://dalabs.academy")
    ).rejects.toThrow();

    expect(await service.findByCode("abc123")).toBe("https://example.com");
  });

  it("starts a saved url at zero clicks", async () => {
    await service.save("abc123", "https://dalabs.academy");

    expect(await service.getClicks("abc123")).toBe(0);
  });

  it("counts each increment so N increments yield N clicks", async () => {
    await service.save("abc123", "https://dalabs.academy");

    for (let i = 0; i < 5; i++) {
      await service.incrementClicks("abc123");
    }

    expect(await service.getClicks("abc123")).toBe(5);
  });

  it("ignores increments for an unknown short code", async () => {
    await service.incrementClicks("does-not-exist");

    expect(await service.getClicks("does-not-exist")).toBeUndefined();
  });
});
