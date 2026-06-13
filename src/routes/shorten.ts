import { FastifyPluginAsync } from "fastify";
import { UrlStore } from "../services/url.service";
import { generateUniqueShortCode, RandomSource } from "../utils/short-code";

interface ShortenRequestBody {
  url: string;
}

interface ShortenRouteOptions {
  urlStore: UrlStore;
  random?: RandomSource;
}

export const shortenRoute: FastifyPluginAsync<ShortenRouteOptions> = async (
  app,
  opts
) => {
  const { urlStore, random } = opts;

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
      const shortCode = generateUniqueShortCode(urlStore, random);

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
