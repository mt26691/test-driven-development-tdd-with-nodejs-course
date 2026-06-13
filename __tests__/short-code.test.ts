import {
  ALPHABET,
  CODE_LENGTH,
  generateShortCode,
  generateUniqueShortCode,
} from "../src/utils/short-code";
import { UrlService } from "../src/services/url.service";

/**
 * Build a deterministic stand-in for `Math.random`.
 *
 * It returns the supplied values in order, one per call. Because the generator
 * receives its randomness through a parameter, feeding it a known sequence makes
 * the output completely predictable — no flaky tests.
 */
const sequence = (values: number[]): (() => number) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe("generateShortCode", () => {
  it("produces a code of the configured length", () => {
    const code = generateShortCode(sequence([0]));

    expect(code).toHaveLength(CODE_LENGTH);
  });

  it("only uses characters from the base62 alphabet", () => {
    // A handful of arbitrary-but-fixed fractions exercise different indices.
    const code = generateShortCode(sequence([0.1, 0.4, 0.99, 0.5, 0.0, 0.73]));

    expect(code).toMatch(/^[0-9A-Za-z]{6}$/);
    for (const char of code) {
      expect(ALPHABET).toContain(char);
    }
  });

  it("is deterministic when the randomness source is injected", () => {
    // random() === 0 maps to index 0, which is the first alphabet character.
    expect(generateShortCode(sequence([0]))).toBe("000000");

    // random() just under 1 maps to the last alphabet character ("z").
    const almostOne = 0.999999;
    expect(generateShortCode(sequence([almostOne]))).toBe("zzzzzz");
  });

  it("maps each random value to the expected alphabet character", () => {
    // 10/62 lands on index 10 ("A"); 36/62 lands on index 36 ("a").
    const code = generateShortCode(
      sequence([10 / 62, 36 / 62, 10 / 62, 36 / 62, 10 / 62, 36 / 62])
    );

    expect(code).toBe("AaAaAa");
  });
});

describe("generateUniqueShortCode", () => {
  it("returns a fresh code when the store is empty", async () => {
    const store = new UrlService();

    const code = await generateUniqueShortCode(store, sequence([0]));

    expect(code).toBe("000000");
  });

  it("regenerates when the first candidate already exists in the store", async () => {
    const store = new UrlService();
    // Seed the store so the first candidate ("000000") collides.
    await store.save("000000", "https://dalabs.academy");

    // First six draws produce "000000" (collision); next six produce "zzzzzz".
    const almostOne = 0.999999;
    const random = sequence([
      0,
      0,
      0,
      0,
      0,
      0,
      almostOne,
      almostOne,
      almostOne,
      almostOne,
      almostOne,
      almostOne,
    ]);

    const code = await generateUniqueShortCode(store, random);

    expect(code).toBe("zzzzzz");
  });
});
