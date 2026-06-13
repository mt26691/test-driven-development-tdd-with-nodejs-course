import { PrismaClient } from "@prisma/client";
import { UrlStore } from "./url.service";

/**
 * Prisma-backed implementation of {@link UrlStore}.
 *
 * This is the payoff of the seam introduced in chapter 6. The route depends only
 * on the `UrlStore` interface, so swapping storage backends means writing a new
 * class that satisfies the same contract — nothing in the route's logic changes.
 * Where {@link UrlService} kept an in-memory Map, this class reads and writes the
 * real `urls` table through Prisma, so shortened URLs survive a restart.
 *
 * Reconciling the interface with the richer row:
 *
 *   The `UrlStore` contract is intentionally narrow — `save(shortCode, url)` and
 *   `findByCode(shortCode)`. The database row is richer: it also has an `id`,
 *   `clicks`, and `createdAt`. We keep the interface unchanged and absorb the
 *   gap *here*: `save` maps the `url` argument to the `originalUrl` column, and
 *   the database fills `clicks` (default 0), `createdAt` (default now()), and the
 *   serial `id` automatically. `findByCode` projects the row back down to just
 *   `originalUrl`, the single string the interface promises. The route never
 *   learns the row got richer — that is the seam doing its job.
 *
 * The `PrismaClient` is injected through the constructor rather than imported
 * directly, so the integration tests can hand in a client pointed at the test
 * database (and a future test could hand in one wrapped in a transaction). In
 * production, `buildApp` passes the shared client from `src/db/prisma`.
 */
export class PrismaUrlRepository implements UrlStore {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Persist a new shortened URL.
   *
   * Maps the interface's `url` to the `originalUrl` column. `clicks`,
   * `createdAt`, and `id` are left to their database defaults.
   */
  async save(shortCode: string, url: string): Promise<void> {
    await this.prisma.url.create({
      data: { shortCode, originalUrl: url },
    });
  }

  /**
   * Look up the original URL for a short code.
   *
   * Returns `undefined` when no row matches — matching the in-memory store's
   * contract exactly, so the route's behaviour is identical whichever backend
   * it talks to. (`findUnique` returns `null` on a miss; we normalise that to
   * `undefined`.)
   */
  async findByCode(shortCode: string): Promise<string | undefined> {
    const row = await this.prisma.url.findUnique({
      where: { shortCode },
    });

    return row?.originalUrl ?? undefined;
  }
}
