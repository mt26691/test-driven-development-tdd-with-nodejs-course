import { FastifyServerOptions } from "fastify";

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";

const LOG_LEVEL_BY_ENV: Record<string, LogLevel> = {
  production: "info",
  development: "debug",
  test: "silent",
};

export const resolveLogLevel = (nodeEnv: string): LogLevel =>
  LOG_LEVEL_BY_ENV[nodeEnv] ?? "info";

export const buildLoggerOptions = (
  nodeEnv: string
): FastifyServerOptions["logger"] => ({
  level: resolveLogLevel(nodeEnv),
});
