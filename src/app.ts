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
import { DEFAULT_BASE_URL } from "./config";
import { buildLoggerOptions } from "./logger";

// A resource the app must release on shutdown (the Prisma client, the pg pool).
// Returning a promise lets the onClose hook await each one.
export type Closer = () => Promise<void> | void;

interface BuildAppOptions {
  // Set to false to silence the logger entirely (most unit tests do this).
  // Leave undefined and the logger is configured from `nodeEnv` below.
  logger?: boolean;
  // The environment the app runs in. Drives the Pino log level
  // (production=info, development=debug, test=silent). Production passes the
  // validated config.NODE_ENV; tests pass an explicit value to assert the level.
  nodeEnv?: string;
  // Resources to release on shutdown. The onClose hook awaits each one when the
  // app is closed. server.ts injects the real Prisma client and pg pool; tests
  // inject spies to prove the hook fired without touching a database. Defaults
  // to none so the Docker-free unit tests never load the DB modules.
  closers?: Closer[];
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
  // The public base used to build the `shortUrl` in responses. Defaults to
  // DEFAULT_BASE_URL so tests stay Docker-free (no config load); production
  // passes the validated config.BASE_URL from the server entry point.
  baseUrl?: string;
}

export const buildApp = async (
  opts: BuildAppOptions = {}
): Promise<FastifyInstance> => {
  const nodeEnv = opts.nodeEnv ?? "development";
  // When `logger` is explicitly false the logger is off (unit tests). Otherwise
  // Fastify's built-in Pino logger is configured from the environment: it emits
  // structured JSON at the level for this NODE_ENV, and Fastify tags every log
  // line with the request id (reqId) so one request's lines can be correlated.
  const logger = opts.logger === false ? false : buildLoggerOptions(nodeEnv);

  const app = Fastify({ logger });

  // One centralized error handler maps custom AppError subclasses, Fastify's
  // schema-validation errors, and anything unexpected to a single { error,
  // message } envelope (see src/error-handler.ts).
  app.setErrorHandler(errorHandler);

  // Graceful shutdown. Fastify's app.close() stops accepting new connections,
  // lets in-flight requests drain, then runs onClose hooks. This hook releases
  // whatever resources the composition root injected: server.ts passes the
  // shared Prisma client and pg pool; tests pass spies (or nothing). Each closer
  // is awaited and isolated so one failure cannot strand the others.
  const closers: Closer[] = opts.closers ?? [];
  app.addHook("onClose", async (instance) => {
    for (const close of closers) {
      try {
        await close();
      } catch (err) {
        instance.log.error(err, "error while closing a resource on shutdown");
      }
    }
  });

  // Pick the storage backend once and share it across every request handled by
  // this app instance. Production defaults to the Prisma-backed repository, so
  // the real app persists to Postgres; tests inject their own store through
  // `opts.urlStore`. Both satisfy the same `UrlStore` interface, so the routes
  // never need to change — this is the chapter-6 seam paying off.
  const urlStore = opts.urlStore ?? new PrismaUrlRepository(prisma);
  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;

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
  await app.register(shortenRoute, { urlStore, baseUrl, random: opts.random });
  await app.register(listRoute, { urlStore, baseUrl });
  await app.register(statsRoute, { urlStore, baseUrl });
  // DELETE /urls/:code shares its path shape with the future bare catch-all only
  // by coincidence — it is a different HTTP method, so the radix router keys it
  // separately and there is no collision with the GET routes.
  await app.register(deleteRoute, { urlStore });
  await app.register(redirectRoute, { urlStore });

  return app;
};
