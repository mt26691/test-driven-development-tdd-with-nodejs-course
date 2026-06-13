import Fastify, { FastifyError, FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { healthRoute } from "./routes/health";
import { shortenRoute } from "./routes/shorten";
import { listRoute } from "./routes/list";
import { statsRoute } from "./routes/stats";
import { redirectRoute } from "./routes/redirect";
import { UrlStore } from "./services/url.service";
import { PrismaUrlRepository } from "./services/prisma-url.repository";
import { prisma } from "./db/prisma";
import { RandomSource } from "./utils/short-code";

interface BuildAppOptions {
  logger?: boolean;
  // Randomness source for short code generation. Tests inject a deterministic
  // function here so the generated codes are predictable; production leaves it
  // undefined and the generator falls back to Math.random.
  random?: RandomSource;
  // The storage backend, injected behind the `UrlStore` interface. This is the
  // seam from chapter 6 paying off: leave it undefined and the app uses the
  // Prisma-backed repository (real persistence to Postgres); the fast unit tests
  // pass an in-memory `UrlService` so they run without a database; the
  // integration tests pass a `PrismaUrlRepository`. The route never knows which.
  urlStore?: UrlStore;
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

  // Pick the storage backend once and share it across every request handled by
  // this app instance. Production defaults to the Prisma-backed repository, so
  // the real app persists to Postgres; tests inject their own store through
  // `opts.urlStore`. Both satisfy the same `UrlStore` interface, so the routes
  // never need to change — this is the chapter-6 seam paying off.
  const urlStore = opts.urlStore ?? new PrismaUrlRepository(prisma);

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

  // Register routes. The redirect route's path is the bare param `/:code`, which
  // would match anything at the root — including /health, /shorten, /urls, and
  // /documentation. Registering it LAST lets Fastify's radix router prefer the
  // more specific static paths, so the catch-all only handles real short codes.
  // In particular `/urls` and `/urls/:code/stats` are more specific than the
  // catch-all and MUST be registered before it, or `GET /urls` would be read as
  // a redirect for the code "urls". (`/urls/:code/stats` has its own static
  // prefix and segment count, so the radix router never confuses it with the
  // bare `/:code`.)
  await app.register(healthRoute);
  await app.register(shortenRoute, { urlStore, random: opts.random });
  await app.register(listRoute, { urlStore });
  await app.register(statsRoute, { urlStore });
  await app.register(redirectRoute, { urlStore });

  return app;
};
