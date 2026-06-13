/**
 * Stores the mapping between a short code and its original URL.
 *
 * This is the seam between the route and the storage backend, first introduced
 * in chapter 6. The route depends on THIS interface, never on a concrete store,
 * so we can swap the implementation freely. In this chapter we do exactly that:
 * the in-memory Map below gives way to a Prisma-backed repository
 * (`PrismaUrlRepository`) that implements the very same contract.
 *
 * The methods are async (`Promise`-returning). The in-memory Map is synchronous,
 * but a database is not — so the interface is async to accommodate any backend.
 * That is the one shape change the swap forces, and it is deliberately made at
 * the seam: the route simply `await`s the calls it already made.
 */
export interface UrlStore {
  save(shortCode: string, url: string): Promise<void>;
  findByCode(shortCode: string): Promise<string | undefined>;
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

  async save(shortCode: string, url: string): Promise<void> {
    this.urls.set(shortCode, url);
  }

  async findByCode(shortCode: string): Promise<string | undefined> {
    return this.urls.get(shortCode);
  }
}
