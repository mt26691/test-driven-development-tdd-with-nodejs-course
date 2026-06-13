import { FastifyPluginAsync } from "fastify";
import { UrlStore } from "../services/url.service";

interface ShortenRequestBody {
  url: string;
}

interface ShortenRouteOptions {
  urlStore: UrlStore;
}

export const shortenRoute: FastifyPluginAsync<ShortenRouteOptions> = async (
  app,
  opts
) => {
  const { urlStore } = opts;

  app.post<{ Body: ShortenRequestBody }>("/shorten", {
    schema: {
      description: "Create a shortened URL",
      tags: ["URLs"],
      body: {
        type: "object",
        required: ["url"],
        additionalProperties: false,
        properties: {
          url: { type: "string" },
        },
      },
      response: {
        201: {
          type: "object",
          required: ["shortCode", "url", "shortUrl"],
          properties: {
            shortCode: { type: "string" },
            url: { type: "string" },
            shortUrl: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { url } = request.body;
      const shortCode = "abc123";

      urlStore.save(shortCode, url);

      reply.code(201);

      return {
        shortCode,
        url,
        shortUrl: `http://localhost:3000/${shortCode}`,
      };
    },
  });
};
