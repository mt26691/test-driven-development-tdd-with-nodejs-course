import { loadConfig } from "../src/config";

const validEnv = {
  DATABASE_URL: "postgres://user:pass@localhost:5433/urlshortener",
  PORT: "4000",
  BASE_URL: "https://sho.rt",
  NODE_ENV: "production",
};

describe("loadConfig", () => {
  it("parses a valid environment into a typed config object", () => {
    const config = loadConfig(validEnv);

    expect(config).toEqual({
      DATABASE_URL: "postgres://user:pass@localhost:5433/urlshortener",
      PORT: 4000,
      BASE_URL: "https://sho.rt",
      NODE_ENV: "production",
    });
  });

  it("coerces PORT from a string to a number", () => {
    const config = loadConfig({ ...validEnv, PORT: "8080" });

    expect(config.PORT).toBe(8080);
    expect(typeof config.PORT).toBe("number");
  });

  it("applies defaults when optional vars are missing", () => {
    const config = loadConfig({
      DATABASE_URL: "postgres://user:pass@localhost:5433/urlshortener",
    });

    expect(config.PORT).toBe(3000);
    expect(config.BASE_URL).toBe("http://localhost:3000");
    expect(config.NODE_ENV).toBe("development");
  });

  it("returns a frozen object so config cannot be mutated at runtime", () => {
    const config = loadConfig(validEnv);

    expect(Object.isFrozen(config)).toBe(true);
    expect(() => {
      (config as { PORT: number }).PORT = 1;
    }).toThrow();
  });

  it("does not read or mutate the global process.env", () => {
    const before = { ...process.env };

    loadConfig(validEnv);

    expect(process.env).toEqual(before);
  });

  it("throws when DATABASE_URL is missing", () => {
    const { DATABASE_URL, ...withoutDb } = validEnv;
    void DATABASE_URL;

    expect(() => loadConfig(withoutDb)).toThrow(/DATABASE_URL/);
  });

  it("throws when DATABASE_URL is not a valid URI", () => {
    expect(() => loadConfig({ ...validEnv, DATABASE_URL: "not a url" })).toThrow(
      /DATABASE_URL/
    );
  });

  it("throws when PORT is not numeric", () => {
    expect(() => loadConfig({ ...validEnv, PORT: "abc" })).toThrow(/PORT/);
  });

  it("throws when NODE_ENV is not an allowed value", () => {
    expect(() => loadConfig({ ...validEnv, NODE_ENV: "staging" })).toThrow(
      /NODE_ENV/
    );
  });

  it("reports every problem at once in a readable message", () => {
    expect(() => loadConfig({ PORT: "abc", NODE_ENV: "staging" })).toThrow(
      /Invalid environment configuration/
    );
  });
});
