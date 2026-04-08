export interface UrlEntry {
  shortCode: string;
  url: string;
  shortUrl: string;
  createdAt: Date;
}

const urls = new Map<string, UrlEntry>();

export const urlStore = {
  save(entry: UrlEntry): void {
    urls.set(entry.shortCode, entry);
  },

  findByShortCode(shortCode: string): UrlEntry | undefined {
    return urls.get(shortCode);
  },

  clear(): void {
    urls.clear();
  },
};
