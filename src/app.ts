import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { healthRoute } from "./routes/health";
import { shortenRoute } from "./routes/shorten";

interface BuildAppOptions {
  logger?: boolean;
}

export const buildApp = async (
  opts: BuildAppOptions = {}
): Promise<FastifyInstance> => {
  const app = Fastify({ logger: opts.logger ?? true });

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
  await app.register(shortenRoute);

  return app;
};
