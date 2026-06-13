import { Prisma, PrismaClient } from "@prisma/client";
import { ConflictError } from "../errors";
import {
  DEFAULT_MAX_ATTEMPTS,
  GenerateCode,
  ListUrlsParams,
  ListUrlsResult,
  UrlRecord,
  UrlStore,
} from "./url.service";

/**
 * Prisma raises P2002 when an insert violates a unique constraint — here, the
 * `urls.short_code` unique index. That is the signal to retry with a fresh code.
 */
const isUniqueConstraintViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

/**
 * A fixed 64-bit key for the global short-code generation advisory lock. Any
 * constant works as long as every caller uses the same one — the value just
 * names the lock inside Postgres.
 */
const GENERATION_LOCK_KEY = 4_815_162_342;

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
   * Save a URL under a freshly generated short code, retrying on collision.
   *
   * This is the SHIPPED strategy. The pre-check the old generator did
   * (findByCode before insert) is a TOCTOU race: under concurrency two requests
   * can both see a code as free and both insert it. So we drop the pre-check and
   * let the database's `short_code` unique index be the single source of truth.
   * Each attempt draws a fresh code and tries to insert; if Postgres rejects it
   * with P2002 we generate another and try again, up to `maxAttempts`. Only if
   * every attempt collides do we give up with a ConflictError (→ 409).
   */
  async saveWithUniqueCode(
    url: string,
    generate: GenerateCode,
    maxAttempts: number = DEFAULT_MAX_ATTEMPTS
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const shortCode = generate();
      try {
        await this.prisma.url.create({
          data: { shortCode, originalUrl: url },
        });
        return shortCode;
      } catch (error) {
        if (isUniqueConstraintViolation(error)) continue;
        throw error;
      }
    }

    throw new ConflictError(
      `Could not generate a unique short code after ${maxAttempts} attempts`
    );
  }

  /**
   * Alternative strategy — serialize generation with a PostgreSQL advisory lock.
   *
   * Where the retry strategy is optimistic (let collisions happen, recover from
   * them), this one is pessimistic: a transaction-scoped advisory lock keyed on
   * a global generation key means only ONE request generates+inserts at a time,
   * so two requests can never pick the same code concurrently in the first
   * place. `pg_advisory_xact_lock` is released automatically when the
   * transaction commits or rolls back, so there is no unlock to forget.
   *
   * It is shown as the documented alternative; the app wires up the retry
   * strategy by default. See the comparison in this chapter's manifest.
   */
  async saveWithAdvisoryLock(
    url: string,
    generate: GenerateCode
  ): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${GENERATION_LOCK_KEY})`;

      let shortCode = generate();
      while (
        (await tx.url.findUnique({ where: { shortCode } })) !== null
      ) {
        shortCode = generate();
      }

      await tx.url.create({ data: { shortCode, originalUrl: url } });
      return shortCode;
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

  /**
   * Look up the full record for a short code, for the stats endpoint.
   *
   * Where `findByCode` projects the row down to just `originalUrl`, the stats
   * endpoint needs the whole record. We project the row to the `UrlRecord`
   * shape the interface promises (dropping the internal `id`) and normalise the
   * `null` from a miss to `undefined`, matching the in-memory store's contract.
   */
  async findRecordByCode(shortCode: string): Promise<UrlRecord | undefined> {
    const row = await this.prisma.url.findUnique({
      where: { shortCode },
    });

    if (!row) return undefined;

    return {
      shortCode: row.shortCode,
      originalUrl: row.originalUrl,
      clicks: row.clicks,
      createdAt: row.createdAt,
    };
  }

  /**
   * Atomically bump the click counter for a short code.
   *
   * `{ clicks: { increment: 1 } }` compiles to `SET clicks = clicks + 1`, which
   * the database applies as one atomic statement. We deliberately avoid a
   * read-modify-write (read clicks, add 1 in JS, write it back): two concurrent
   * redirects could both read the same value and both write back the same +1,
   * losing a count. The atomic increment never loses a hit.
   */
  async incrementClicks(shortCode: string): Promise<void> {
    await this.prisma.url.update({
      where: { shortCode },
      data: { clicks: { increment: 1 } },
    });
  }

  /**
   * Return one page of URLs, newest first, plus the total row count.
   *
   * Limit/offset pagination: `skip = (page - 1) * limit`, `take = limit`. The
   * order is `createdAt` descending with `id` descending as the tiebreaker — two
   * rows created in the same instant still order deterministically, so page
   * boundaries never duplicate or drop a row. `findMany` and `count` run inside
   * one `$transaction` so the page and the total come from the same snapshot.
   */
  async list({ page, limit }: ListUrlsParams): Promise<ListUrlsResult> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.url.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.url.count(),
    ]);

    return {
      items: rows.map((row) => ({
        shortCode: row.shortCode,
        originalUrl: row.originalUrl,
        clicks: row.clicks,
        createdAt: row.createdAt,
      })),
      total,
    };
  }

  /**
   * Hard-delete the row for a short code, returning whether anything was removed.
   *
   * We use `deleteMany` rather than `delete` deliberately: `delete` throws
   * (P2025) when no row matches, forcing a try/catch to tell "deleted" from
   * "wasn't there". `deleteMany` never throws on a miss — it reports `count`,
   * which is `1` for a real deletion and `0` for an unknown code. That maps
   * cleanly onto the handler's 204-vs-404 decision, and `shortCode` is unique so
   * the count is only ever 0 or 1.
   */
  async delete(shortCode: string): Promise<boolean> {
    const { count } = await this.prisma.url.deleteMany({
      where: { shortCode },
    });

    return count > 0;
  }
}
