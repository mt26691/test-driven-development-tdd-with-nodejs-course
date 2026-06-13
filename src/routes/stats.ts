import { FastifyPluginAsync } from "fastify";
import { UrlStore } from "../services/url.service";

interface StatsRouteParams {
  code: string;
}

interface StatsRouteOptions {
  urlStore: UrlStore;
}

export const statsRoute: FastifyPluginAsync<StatsRouteOptions> = async (
  app,
  opts
) => {
  const { urlStore } = opts;

  app.get<{ Params: StatsRouteParams }>("/urls/:code/stats", {
    schema: {
      description: "Return metadata and click stats for a single short code",
      tags: ["URLs"],
      params: {
        type: "object",
        required: ["code"],
        properties: {
          code: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          required: [
            "shortCode",
            "originalUrl",
            "clicks",
            "createdAt",
            "shortUrl",
          ],
          properties: {
            shortCode: { type: "string" },
            originalUrl: { type: "string" },
            clicks: { type: "integer" },
            createdAt: { type: "string" },
            shortUrl: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { code } = request.params;

      const record = await urlStore.findRecordByCode(code);

      if (record === undefined) {
        reply.code(404);
        return {
          error: "Not Found",
          message: `No URL found for code "${code}"`,
        };
      }

      return {
        shortCode: record.shortCode,
        originalUrl: record.originalUrl,
        clicks: record.clicks,
        createdAt: record.createdAt.toISOString(),
        shortUrl: `http://localhost:3000/${record.shortCode}`,
      };
    },
  });
};
