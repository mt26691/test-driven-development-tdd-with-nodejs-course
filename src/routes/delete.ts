import { FastifyPluginAsync } from "fastify";
import { UrlStore } from "../services/url.service";

interface DeleteRouteParams {
  code: string;
}

interface DeleteRouteOptions {
  urlStore: UrlStore;
}

export const deleteRoute: FastifyPluginAsync<DeleteRouteOptions> = async (
  app,
  opts
) => {
  const { urlStore } = opts;

  app.delete<{ Params: DeleteRouteParams }>("/urls/:code", {
    schema: {
      description: "Delete a single short URL by its code",
      tags: ["URLs"],
      params: {
        type: "object",
        required: ["code"],
        properties: {
          code: { type: "string" },
        },
      },
      response: {
        204: { type: "null" },
        404: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { code } = request.params;

      const deleted = await urlStore.delete(code);

      if (!deleted) {
        reply.code(404);
        return {
          error: "Not Found",
          message: `No URL found for code "${code}"`,
        };
      }

      reply.code(204);
      return null;
    },
  });
};
