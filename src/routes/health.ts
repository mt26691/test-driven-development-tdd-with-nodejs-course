import { FastifyPluginAsync } from "fastify";

export const healthRoute: FastifyPluginAsync = async (app) => {
  app.get("/health", {
    schema: {
      description: "Health check endpoint",
      tags: ["Health"],
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    handler: async () => {
      // TODO: implement health check response
      return {};
    },
  });
};
