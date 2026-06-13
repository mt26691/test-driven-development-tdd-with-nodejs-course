import { FastifyPluginAsync } from "fastify";
import { UrlStore } from "../services/url.service";
import { NotFoundError } from "../errors";

interface StatsRouteParams {
  code: string;
}

interface StatsRouteOptions {
  urlStore: UrlStore;
  baseUrl: string;
}

export const statsRoute: FastifyPluginAsync<StatsRouteOptions> = async (
  app,
  opts
) => {
  const { urlStore, baseUrl } = opts;

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
    handler: async (request) => {
      const { code } = request.params;

      const record = await urlStore.findRecordByCode(code);

      if (record === undefined) {
        throw new NotFoundError(`No URL found for code "${code}"`);
      }

      return {
        shortCode: record.shortCode,
        originalUrl: record.originalUrl,
        clicks: record.clicks,
        createdAt: record.createdAt.toISOString(),
        shortUrl: `${baseUrl}/${record.shortCode}`,
      };
    },
  });
};
