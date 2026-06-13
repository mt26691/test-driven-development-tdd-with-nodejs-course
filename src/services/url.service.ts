import { ConflictError } from "../errors";

/**
 * Default number of code-generation attempts before giving up with a
 * ConflictError. Shared by every UrlStore so the retry budget is consistent.
 */
export const DEFAULT_MAX_ATTEMPTS = 5;

/**
 * Thrown by the in-memory store when an insert hits an existing code. It mirrors
 * the database unique-constraint violation (Prisma P2002), so the retry loop is
 * exercised the same way in unit tests as it is against a real database.
 */
export class UniqueCodeViolation extends Error {
  constructor(readonly shortCode: string) {
    super(`Short code already exists: ${shortCode}`);
    this.name = "UniqueCodeViolation";
  }
}

/**
 * Stores the mapping between a short code and its original URL.
 *
 * This is the seam between the route and the storage backend, first introduced
 * in chapter 6. The route depends on THIS interface, never on a concrete store,
 * so we can swap the implementation freely.
 *
 * The methods are async (`Promise`-returning). The in-memory Map is synchronous,
 * but a database is not — so the interface is async to accommodate any backend.
 *
 * `incrementClicks` is added in chapter 14 so the redirect can count every hit.
 * `list` is added in chapter 15 so the API can return a paginated list of URLs:
 * each backend slices its own storage (skip/take + count in SQL for Prisma, a
 * sorted slice for the in-memory Map) and returns the same `{ items, total }`
 * shape, so the route never learns which store it is talking to.
 *
 * `findRecordByCode` is added in chapter 16 for the stats endpoint. Where
 * `findByCode` only returns the original URL string, the stats endpoint needs
 * the whole record (clicks, createdAt, ...), so this method returns the full
 * `UrlRecord` — or `undefined` for an unknown code, matching `findByCode`.
 *
 * `delete` is added in chapter 17 for the delete endpoint. It returns a boolean
 * — `true` if a row was actually removed, `false` if the code did not exist —
 * so the thin handler can map a real deletion to 204 and a miss to 404 without
 * a second lookup.
 */

/**
 * A single stored URL, projected for the list endpoint.
 *
 * `findByCode` only ever needed the original URL string, but listing has to
 * surface the whole record — so this richer shape carries everything an item in
 * the list exposes.
 */
export interface UrlRecord {
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
}

/**
 * Pagination request for {@link UrlStore.list}: a 1-based page number and the
 * page size. The route resolves the schema's defaults before calling, so both
 * are always present here.
 */
export interface ListUrlsParams {
  page: number;
  limit: number;
}

/**
 * One page of URLs plus the grand total, so the caller can compute how many
 * pages exist. `total` is the count of ALL rows, not just the ones on this page.
 */
export interface ListUrlsResult {
  items: UrlRecord[];
  total: number;
}

/**
 * A function that produces a candidate short code. The store calls it once per
 * insert attempt, so a fresh candidate is drawn on every retry.
 */
export type GenerateCode = () => string;

export interface UrlStore {
  save(shortCode: string, url: string): Promise<void>;
  saveWithUniqueCode(
    url: string,
    generate: GenerateCode,
    maxAttempts?: number
  ): Promise<string>;
  findByCode(shortCode: string): Promise<string | undefined>;
  findRecordByCode(shortCode: string): Promise<UrlRecord | undefined>;
  incrementClicks(shortCode: string): Promise<void>;
  list(params: ListUrlsParams): Promise<ListUrlsResult>;
  delete(shortCode: string): Promise<boolean>;
}

/**
 * In-memory implementation of {@link UrlStore} backed by a Map.
 *
 * Still used by the fast unit tests: the route's unit suite injects this store
 * so it runs without a database (no Docker, no Postgres) and stays quick. The
 * production app uses the Prisma-backed store instead — see `buildApp`.
 *
 * The methods are `async` only to satisfy the interface; the Map operations
 * themselves are synchronous, so each one resolves immediately.
 */
export class UrlService implements UrlStore {
  private readonly records = new Map<string, UrlRecord>();
  private seq = 0;

  async save(shortCode: string, url: string): Promise<void> {
    if (this.records.has(shortCode)) {
      // Model the database unique constraint: a second insert of the same code
      // is rejected, not silently overwritten.
      throw new UniqueCodeViolation(shortCode);
    }

    this.seq += 1;
    this.records.set(shortCode, {
      shortCode,
      originalUrl: url,
      clicks: 0,
      // Offset the timestamp by an increasing sequence so two URLs saved in the
      // same millisecond still order deterministically — newest first.
      createdAt: new Date(Date.now() + this.seq),
    });
  }

  async saveWithUniqueCode(
    url: string,
    generate: GenerateCode,
    maxAttempts: number = DEFAULT_MAX_ATTEMPTS
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const shortCode = generate();
      try {
        await this.save(shortCode, url);
        return shortCode;
      } catch (error) {
        if (error instanceof UniqueCodeViolation) continue;
        throw error;
      }
    }

    throw new ConflictError(
      `Could not generate a unique short code after ${maxAttempts} attempts`
    );
  }

  async findByCode(shortCode: string): Promise<string | undefined> {
    return this.records.get(shortCode)?.originalUrl;
  }

  async findRecordByCode(shortCode: string): Promise<UrlRecord | undefined> {
    return this.records.get(shortCode);
  }

  async incrementClicks(shortCode: string): Promise<void> {
    const record = this.records.get(shortCode);
    if (!record) return;
    record.clicks += 1;
  }

  async getClicks(shortCode: string): Promise<number | undefined> {
    return this.records.get(shortCode)?.clicks;
  }

  async list({ page, limit }: ListUrlsParams): Promise<ListUrlsResult> {
    const sorted = [...this.records.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const offset = (page - 1) * limit;
    const items = sorted.slice(offset, offset + limit);

    return { items, total: sorted.length };
  }

  // `Map.delete` already returns whether a key was present, which is exactly the
  // true/false the handler needs to map to 204 vs 404 — no separate lookup.
  async delete(shortCode: string): Promise<boolean> {
    return this.records.delete(shortCode);
  }
}
