/**
 * The protocols we are willing to shorten.
 *
 * A URL shortener should only ever redirect to a web page, so we allow-list
 * `http:` and `https:` and reject everything else. This is what blocks
 * `ftp://`, `mailto:`, `file://`, and — most importantly — `javascript:`,
 * which could turn a short link into a stored-XSS vector.
 */
export const ALLOWED_PROTOCOLS = ["http:", "https:"] as const;

/**
 * The maximum number of characters we accept for an incoming URL.
 *
 * 2048 is the de-facto safe ceiling for URLs across browsers, proxies, and
 * servers (it traces back to old Internet Explorer limits and has stuck as a
 * practical bound). Capping the length keeps obviously-bogus or abusive input
 * out of the store and bounds how much data we ever persist per row.
 */
export const MAX_URL_LENGTH = 2048;

/**
 * Decide whether a string is a URL we are willing to shorten.
 *
 * The check is intentionally strict and uses the WHATWG `URL` parser (the
 * global `URL` constructor) rather than a hand-rolled regex:
 *
 * 1. The value must be a non-empty string within {@link MAX_URL_LENGTH}.
 * 2. It must parse as an absolute URL — `new URL()` throws on garbage like
 *    `"not a url"`, which we catch and treat as invalid.
 * 3. Its protocol must be in {@link ALLOWED_PROTOCOLS}.
 *
 * Step 3 is the reason a JSON-schema `format: "uri"` constraint is not enough
 * on its own: `format: "uri"` happily accepts `ftp://...` and `javascript:...`
 * because they are syntactically valid URIs. Only by inspecting the parsed
 * `protocol` can we allow-list `http`/`https` and reject the rest.
 *
 * The function is pure — same input, same output — so it is trivial to unit
 * test with a table of edge cases.
 */
export const isValidHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  if (value.length === 0 || value.length > MAX_URL_LENGTH) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    // `new URL()` throws a TypeError for strings that are not absolute URLs.
    return false;
  }

  return (ALLOWED_PROTOCOLS as readonly string[]).includes(parsed.protocol);
};
