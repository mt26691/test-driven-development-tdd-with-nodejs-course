import { FastifyPluginAsync } from "fastify";

interface ShortenRequestBody {
  url: string;
}

export const shortenRoute: FastifyPluginAsync = async (app) => {
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
      const shortCode = "abc123";

      reply.code(201);

      return {
        shortCode,
        url: request.body.url,
        shortUrl: `http://localhost:3000/${shortCode}`,
      };
    },
  });
};
