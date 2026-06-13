import Fastify, { FastifyInstance } from "fastify";
import { errorHandler } from "../src/error-handler";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../src/errors";

const buildErrorApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);

  app.get("/not-found", async () => {
    throw new NotFoundError('No URL found for code "nope"');
  });

  app.get("/validation", async () => {
    throw new ValidationError("url must be a valid http(s) URL");
  });

  app.get("/conflict", async () => {
    throw new ConflictError("short code already exists");
  });

  app.get("/boom", async () => {
    throw new Error("DB password is hunter2 at line 42");
  });

  app.post("/schema", {
    schema: {
      body: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" } },
      },
    },
    handler: async () => ({ ok: true }),
  });

  await app.ready();
  return app;
};

describe("centralized error handler", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildErrorApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("maps NotFoundError to 404 with { error, message }", async () => {
    const response = await app.inject({ method: "GET", url: "/not-found" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: "Not Found",
      message: 'No URL found for code "nope"',
    });
  });

  it("maps ValidationError to 400 with { error, message }", async () => {
    const response = await app.inject({ method: "GET", url: "/validation" });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Bad Request",
      message: "url must be a valid http(s) URL",
    });
  });

  it("maps ConflictError to 409 with { error, message }", async () => {
    const response = await app.inject({ method: "GET", url: "/conflict" });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: "Conflict",
      message: "short code already exists",
    });
  });

  it("maps a Fastify schema validation error to 400 with { error, message }", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/schema",
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Bad Request");
    expect(typeof response.json().message).toBe("string");
  });

  it("maps an unexpected error to a generic 500 that leaks no internals", async () => {
    const response = await app.inject({ method: "GET", url: "/boom" });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });

    expect(response.body).not.toContain("hunter2");
    expect(response.body).not.toContain("line 42");
    expect(response.body).not.toContain("stack");
  });
});
