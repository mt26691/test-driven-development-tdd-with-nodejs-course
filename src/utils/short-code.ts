import { UrlStore } from "../services/url.service";

/**
 * The base62 alphabet: digits, uppercase letters, then lowercase letters.
 *
 * 62 characters means each position in a code carries log2(62) ≈ 5.95 bits of
 * entropy. A 6-character code therefore has 62^6 ≈ 56.8 billion possible
 * values — plenty of room before collisions become likely for a side project,
 * while staying short enough to be friendly in a URL.
 */
export const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * The number of characters in every generated short code.
 */
export const CODE_LENGTH = 6;

/**
 * A function that returns a random float in the half-open interval [0, 1).
 *
 * This mirrors the contract of `Math.random`, which is the default source.
 */
export type RandomSource = () => number;

/**
 * Generate a random base62 short code.
 *
 * The function is pure with respect to its `random` argument: given the same
 * sequence of values from `random`, it always returns the same code. Injecting
 * the randomness source (rather than calling `Math.random` directly) is what
 * makes the generator testable without flaky assertions.
 *
 * @param random - the randomness source; defaults to `Math.random`.
 */
export const generateShortCode = (
  random: RandomSource = Math.random
): string => {
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i++) {
    // random() is in [0, 1); scaling by the alphabet length and flooring gives
    // an index in [0, ALPHABET.length - 1].
    const index = Math.floor(random() * ALPHABET.length);
    code += ALPHABET[index];
  }

  return code;
};

/**
 * Generate a short code that is not already present in the given store.
 *
 * Collisions are astronomically rare at this scale, but "rare" is not "never".
 * If a freshly generated code already exists, we simply draw another one and
 * try again. The loop is the uniqueness guarantee.
 *
 * @param store - the store to check candidate codes against.
 * @param random - the randomness source; defaults to `Math.random`.
 */
export const generateUniqueShortCode = (
  store: UrlStore,
  random: RandomSource = Math.random
): string => {
  let code = generateShortCode(random);

  while (store.findByCode(code) !== undefined) {
    code = generateShortCode(random);
  }

  return code;
};
