import { FastifyPluginAsync } from "fastify";
import { UrlStore } from "../services/url.service";
import { generateShortCode, RandomSource } from "../utils/short-code";
import { MAX_URL_LENGTH, isValidHttpUrl } from "../utils/validate-url";

interface ShortenRequestBody {
  url: string;
}

interface ShortenRouteOptions {
  urlStore: UrlStore;
  baseUrl: string;
  random?: RandomSource;
}

export const shortenRoute: FastifyPluginAsync<ShortenRouteOptions> = async (
  app,
  opts
) => {
  const { urlStore, baseUrl, random } = opts;

  app.post<{ Body: ShortenRequestBody }>("/shorten", {
    schema: {
      description: "Create a shortened URL",
      tags: ["URLs"],
      body: {
        type: "object",
        required: ["url"],
        additionalProperties: false,
        properties: {
          // The schema catches the cheap, structural problems before our
          // handler ever runs: wrong type, empty string, or absurdly long
          // input. `format: "uri"` rejects obvious non-URLs, but it is NOT
          // enough on its own — it happily accepts ftp:// and javascript:,
          // so the handler still runs the protocol allow-list check below.
          url: {
            type: "string",
            format: "uri",
            minLength: 1,
            maxLength: MAX_URL_LENGTH,
          },
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

      // Schema validation guarantees `url` is a non-empty, bounded string, but
      // it cannot enforce our protocol allow-list. Use the WHATWG URL parser to
      // reject anything that is not http(s) — including ftp:// and javascript:.
      if (!isValidHttpUrl(url)) {
        reply.code(400);
        return {
          error: "Bad Request",
          message: "url must be a valid http or https URL",
        };
      }

      // The store owns the generate-and-insert loop: it draws a fresh code from
      // `generate` on every attempt and relies on the database unique constraint
      // (not a racy pre-check) to reject duplicates, retrying on conflict.
      const shortCode = await urlStore.saveWithUniqueCode(url, () =>
        generateShortCode(random)
      );

      reply.code(201);

      return {
        shortCode,
        url,
        shortUrl: `${baseUrl}/${shortCode}`,
      };
    },
  });
};
