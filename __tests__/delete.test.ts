import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { UrlService } from "../src/services/url.service";

describe("DELETE /urls/:code", () => {
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

  it("returns 204 with an empty body when deleting an existing code", async () => {
    await store.save("abc123", "https://dalabs.academy");

    const response = await app.inject({
      method: "DELETE",
      url: "/urls/abc123",
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });

  it("removes the code so a later redirect returns 404", async () => {
    await store.save("gone01", "https://dalabs.academy");

    await app.inject({ method: "DELETE", url: "/urls/gone01" });

    const redirect = await app.inject({ method: "GET", url: "/gone01" });
    expect(redirect.statusCode).toBe(404);

    const stats = await app.inject({ method: "GET", url: "/urls/gone01/stats" });
    expect(stats.statusCode).toBe(404);
  });

  it("returns 404 when deleting a code that does not exist", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/urls/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe("Not Found");
  });

  it("returns 404 when deleting an already-deleted code", async () => {
    await store.save("twice0", "https://dalabs.academy");

    const first = await app.inject({ method: "DELETE", url: "/urls/twice0" });
    expect(first.statusCode).toBe(204);

    const second = await app.inject({ method: "DELETE", url: "/urls/twice0" });
    expect(second.statusCode).toBe(404);
  });

  it("only deletes the targeted code, leaving the others intact", async () => {
    await store.save("keep01", "https://example.com/keep");
    await store.save("drop01", "https://example.com/drop");

    await app.inject({ method: "DELETE", url: "/urls/drop01" });

    expect(await store.findByCode("keep01")).toBe("https://example.com/keep");
    expect(await store.findByCode("drop01")).toBeUndefined();
  });
});
