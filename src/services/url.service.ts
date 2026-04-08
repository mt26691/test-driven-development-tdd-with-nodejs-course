import { urlStore, UrlEntry } from "../store";

const generateShortCode = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

export const shortenUrl = (url: string): UrlEntry => {
  const shortCode = generateShortCode();
  const entry: UrlEntry = {
    shortCode,
    url,
    shortUrl: `http://localhost:3000/${shortCode}`,
    createdAt: new Date(),
  };

  urlStore.save(entry);

  return entry;
};
