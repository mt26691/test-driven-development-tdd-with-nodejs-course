import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { errorHandler } from "./error-handler";
import { healthRoute } from "./routes/health";
import { shortenRoute } from "./routes/shorten";
import { listRoute } from "./routes/list";
import { statsRoute } from "./routes/stats";
import { deleteRoute } from "./routes/delete";
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

  // One centralized error handler maps custom AppError subclasses, Fastify's
  // schema-validation errors, and anything unexpected to a single { error,
  // message } envelope (see src/error-handler.ts).
  app.setErrorHandler(errorHandler);

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
  // DELETE /urls/:code shares its path shape with the future bare catch-all only
  // by coincidence — it is a different HTTP method, so the radix router keys it
  // separately and there is no collision with the GET routes.
  await app.register(deleteRoute, { urlStore });
  await app.register(redirectRoute, { urlStore });

  return app;
};
