import { Type, Static } from "@sinclair/typebox";
import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";

export const DEFAULT_PORT = 3000;
export const DEFAULT_BASE_URL = "http://localhost:3000";

const ConfigSchema = Type.Object(
  {
    DATABASE_URL: Type.String({ format: "uri", minLength: 1 }),
    PORT: Type.Integer({ minimum: 1, maximum: 65535, default: DEFAULT_PORT }),
    BASE_URL: Type.String({
      format: "uri",
      minLength: 1,
      default: DEFAULT_BASE_URL,
    }),
    NODE_ENV: Type.Unsafe<"development" | "test" | "production">({
      type: "string",
      enum: ["development", "test", "production"],
      default: "development",
    }),
  },
  { additionalProperties: true }
);

export type Config = Static<typeof ConfigSchema>;

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  coerceTypes: true,
});
addFormats(ajv);

const validate = ajv.compile(ConfigSchema);

const formatErrors = (errors: ErrorObject[]): string =>
  errors
    .map((err) => {
      const key =
        (err.params as { missingProperty?: string }).missingProperty ??
        err.instancePath.replace(/^\//, "") ??
        "(root)";
      return `  - ${key}: ${err.message}`;
    })
    .join("\n");

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => {
  const candidate: Record<string, unknown> = {
    DATABASE_URL: env.DATABASE_URL,
    PORT: env.PORT,
    BASE_URL: env.BASE_URL,
    NODE_ENV: env.NODE_ENV,
  };

  for (const key of Object.keys(candidate)) {
    if (candidate[key] === undefined) {
      delete candidate[key];
    }
  }

  if (!validate(candidate)) {
    const details = formatErrors(validate.errors ?? []);
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return Object.freeze(candidate as Config);
};

let cached: Config | undefined;

export const getConfig = (): Config => {
  if (!cached) {
    cached = loadConfig();
  }
  return cached;
};
