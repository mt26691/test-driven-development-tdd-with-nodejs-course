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

export interface UrlStore {
  save(shortCode: string, url: string): Promise<void>;
  findByCode(shortCode: string): Promise<string | undefined>;
  incrementClicks(shortCode: string): Promise<void>;
  list(params: ListUrlsParams): Promise<ListUrlsResult>;
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

  async findByCode(shortCode: string): Promise<string | undefined> {
    return this.records.get(shortCode)?.originalUrl;
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
}
