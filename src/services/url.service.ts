/**
 * Stores the mapping between a short code and its original URL.
 *
 * This is the seam between the route and the storage backend. Today it is a
 * plain in-memory Map; in a later chapter we swap the implementation for a
 * database-backed one without touching the route or its tests.
 */
export interface UrlStore {
  save(shortCode: string, url: string): void;
  findByCode(shortCode: string): string | undefined;
}

/**
 * In-memory implementation of {@link UrlStore} backed by a Map.
 *
 * The Map lives for the lifetime of the instance, so every request handled by
 * the same app instance shares the same store. That is exactly what we want in
 * production, but it also means state leaks across tests that reuse one
 * instance — something we revisit in the test-isolation chapter.
 */
export class UrlService implements UrlStore {
  private readonly urls = new Map<string, string>();

  save(shortCode: string, url: string): void {
    this.urls.set(shortCode, url);
  }

  findByCode(shortCode: string): string | undefined {
    return this.urls.get(shortCode);
  }
}
