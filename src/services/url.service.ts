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
 * It is part of the same narrow contract: the route calls it after a successful
 * lookup, and each backend implements the increment in whatever way is correct
 * for it — atomically in SQL for the Prisma store, on a counter Map in memory.
 */
export interface UrlStore {
  save(shortCode: string, url: string): Promise<void>;
  findByCode(shortCode: string): Promise<string | undefined>;
  incrementClicks(shortCode: string): Promise<void>;
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
  private readonly urls = new Map<string, string>();
  private readonly clicks = new Map<string, number>();

  async save(shortCode: string, url: string): Promise<void> {
    this.urls.set(shortCode, url);
    this.clicks.set(shortCode, 0);
  }

  async findByCode(shortCode: string): Promise<string | undefined> {
    return this.urls.get(shortCode);
  }

  async incrementClicks(shortCode: string): Promise<void> {
    if (!this.urls.has(shortCode)) return;
    this.clicks.set(shortCode, (this.clicks.get(shortCode) ?? 0) + 1);
  }

  async getClicks(shortCode: string): Promise<number | undefined> {
    return this.clicks.get(shortCode);
  }
}
