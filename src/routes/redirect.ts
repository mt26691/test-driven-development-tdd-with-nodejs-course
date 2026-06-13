import { FastifyPluginAsync } from "fastify";
import { UrlStore } from "../services/url.service";
import { NotFoundError } from "../errors";

interface RedirectRouteParams {
  code: string;
}

interface RedirectRouteOptions {
  urlStore: UrlStore;
}

export const redirectRoute: FastifyPluginAsync<RedirectRouteOptions> = async (
  app,
  opts
) => {
  const { urlStore } = opts;

  app.get<{ Params: RedirectRouteParams }>("/:code", {
    schema: {
      description: "Redirect a short code to its original URL",
      tags: ["URLs"],
      params: {
        type: "object",
        required: ["code"],
        properties: {
          code: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      const { code } = request.params;

      const originalUrl = await urlStore.findByCode(code);

      if (originalUrl === undefined) {
        throw new NotFoundError(`No URL found for code "${code}"`);
      }

      // Count the hit. We `await` so a failed increment surfaces rather than
      // becoming a silent unhandled rejection; the trade-off is a little latency
      // on the redirect. The increment is atomic in the store (see
      // PrismaUrlRepository.incrementClicks), so concurrent hits never lose a
      // count.
      await urlStore.incrementClicks(code);

      // 302 Found, not 301 Moved Permanently: a 301 is cached hard by browsers
      // and proxies, so this click tracking would never see the repeat hit and
      // we could never change the target. 302 keeps every request flowing
      // through this handler.
      return reply.redirect(originalUrl, 302);
    },
  });
};
