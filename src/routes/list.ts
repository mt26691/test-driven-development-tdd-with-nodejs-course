import { FastifyPluginAsync } from "fastify";
import { UrlStore } from "../services/url.service";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface ListQuerystring {
  page: number;
  limit: number;
}

interface ListRouteOptions {
  urlStore: UrlStore;
  baseUrl: string;
}

export const listRoute: FastifyPluginAsync<ListRouteOptions> = async (
  app,
  opts
) => {
  const { urlStore, baseUrl } = opts;

  app.get<{ Querystring: ListQuerystring }>("/urls", {
    schema: {
      description: "List all shortened URLs, newest first, paginated",
      tags: ["URLs"],
      querystring: {
        type: "object",
        additionalProperties: false,
        properties: {
          page: { type: "integer", minimum: 1, default: DEFAULT_PAGE },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: MAX_LIMIT,
            default: DEFAULT_LIMIT,
          },
        },
      },
      response: {
        200: {
          type: "object",
          required: ["data", "page", "limit", "total"],
          properties: {
            data: {
              type: "array",
              items: {
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
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
          },
        },
      },
    },
    handler: async (request) => {
      const { page, limit } = request.query;

      const { items, total } = await urlStore.list({ page, limit });

      return {
        data: items.map((item) => ({
          shortCode: item.shortCode,
          originalUrl: item.originalUrl,
          clicks: item.clicks,
          createdAt: item.createdAt.toISOString(),
          shortUrl: `${baseUrl}/${item.shortCode}`,
        })),
        page,
        limit,
        total,
      };
    },
  });
};
