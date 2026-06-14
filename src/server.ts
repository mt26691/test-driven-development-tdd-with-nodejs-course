import { buildApp } from "./app";
import { getConfig } from "./config";
import { prisma } from "./db/prisma";
import { pool } from "./db/pool";

const start = async (): Promise<void> => {
  let config;
  try {
    config = getConfig();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Inject the real resources to release on shutdown. The onClose hook inside
  // buildApp awaits each one when app.close() runs.
  const app = await buildApp({
    baseUrl: config.BASE_URL,
    nodeEnv: config.NODE_ENV,
    closers: [() => prisma.$disconnect(), () => pool.end()],
  });

  // Drain in-flight requests and release resources on a shutdown signal.
  // Containers/k8s send SIGTERM on a rolling deploy or scale-down; Ctrl+C sends
  // SIGINT locally. app.close() stops the listener and runs the onClose hook
  // (Prisma disconnect + pool end). The guard makes a second signal a no-op so
  // we never close twice.
  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      process.exit(0);
    } catch (err) {
      app.log.error(err, "error during graceful shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  try {
    await app.listen({ port: config.PORT });
    app.log.info(
      `Documentation at ${config.BASE_URL}/documentation (NODE_ENV=${config.NODE_ENV})`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
