import Fastify, { FastifyError, FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { healthRoute } from "./routes/health";
import { shortenRoute } from "./routes/shorten";
import { UrlService } from "./services/url.service";
import { RandomSource } from "./utils/short-code";

interface BuildAppOptions {
  logger?: boolean;
  // Randomness source for short code generation. Tests inject a deterministic
  // function here so the generated codes are predictable; production leaves it
  // undefined and the generator falls back to Math.random.
  random?: RandomSource;
}

export const buildApp = async (
  opts: BuildAppOptions = {}
): Promise<FastifyInstance> => {
  const app = Fastify({ logger: opts.logger ?? true });

  // Normalise every error into a single, consistent shape: { error, message }.
  // Fastify's default body for a failed schema validation carries extra fields
  // (statusCode, code), which would make our 400s look different depending on
  // whether the schema or our own handler rejected the request. Mapping schema
  // validation errors here keeps the API's error contract uniform — and seeds
  // the dedicated error-handling chapter, where this grows into a full strategy.
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error.validation) {
      reply.code(400).send({
        error: "Bad Request",
        message: error.message,
      });
      return;
    }

    // Anything unexpected keeps Fastify's default handling.
    reply.send(error);
  });

  // Instantiate the store once and share it across every request handled by
  // this app instance. Later chapters swap this for a database-backed store
  // implementing the same interface — the routes never need to change.
  const urlStore = new UrlService();

  await app.register(swagger, {
    openapi: {
      info: {
        title: "URL Shortener API",
        description: "A URL shortener service built with Fastify and TDD",
        version: "1.0.0",
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/documentation",
  });

  // Register routes
  await app.register(healthRoute);
  await app.register(shortenRoute, { urlStore, random: opts.random });

  return app;
};
