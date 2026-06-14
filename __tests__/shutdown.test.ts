import { buildApp } from "../src/app";
import { UrlService } from "../src/services/url.service";

describe("graceful shutdown", () => {
  it("runs every injected closer when the app is closed", async () => {
    const disconnectPrisma = jest.fn(async () => undefined);
    const endPool = jest.fn(async () => undefined);

    const app = await buildApp({
      nodeEnv: "test",
      urlStore: new UrlService(),
      closers: [disconnectPrisma, endPool],
    });
    await app.ready();

    expect(disconnectPrisma).not.toHaveBeenCalled();
    expect(endPool).not.toHaveBeenCalled();

    await app.close();

    expect(disconnectPrisma).toHaveBeenCalledTimes(1);
    expect(endPool).toHaveBeenCalledTimes(1);
  });

  it("still closes the remaining resources if one closer throws", async () => {
    const failing = jest.fn(async () => {
      throw new Error("disconnect failed");
    });
    const endPool = jest.fn(async () => undefined);

    const app = await buildApp({
      nodeEnv: "test",
      urlStore: new UrlService(),
      closers: [failing, endPool],
    });
    await app.ready();

    await expect(app.close()).resolves.toBeUndefined();

    expect(failing).toHaveBeenCalledTimes(1);
    expect(endPool).toHaveBeenCalledTimes(1);
  });
});
