import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";
import { resolveLogLevel } from "../src/logger";

describe("resolveLogLevel", () => {
  it("uses 'info' in production", () => {
    expect(resolveLogLevel("production")).toBe("info");
  });

  it("uses 'debug' in development", () => {
    expect(resolveLogLevel("development")).toBe("debug");
  });

  it("uses 'silent' in test", () => {
    expect(resolveLogLevel("test")).toBe("silent");
  });

  it("falls back to 'info' for an unknown environment", () => {
    expect(resolveLogLevel("staging")).toBe("info");
  });
});

describe("logger configuration", () => {
  let app: FastifyInstance;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("sets the log level from NODE_ENV (production => info)", async () => {
    app = await buildApp({ nodeEnv: "production" });
    await app.ready();

    expect(app.log.level).toBe("info");
  });

  it("sets the log level from NODE_ENV (development => debug)", async () => {
    app = await buildApp({ nodeEnv: "development" });
    await app.ready();

    expect(app.log.level).toBe("debug");
  });

  it("sets the log level from NODE_ENV (test => silent)", async () => {
    app = await buildApp({ nodeEnv: "test" });
    await app.ready();

    expect(app.log.level).toBe("silent");
  });

  it("assigns a request id to every request for log correlation", async () => {
    app = await buildApp({ nodeEnv: "test" });

    let seenReqId: unknown;
    app.addHook("onRequest", async (request) => {
      seenReqId = request.id;
    });

    await app.ready();

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(typeof seenReqId).toBe("string");
    expect(seenReqId).toBeTruthy();
  });
});
