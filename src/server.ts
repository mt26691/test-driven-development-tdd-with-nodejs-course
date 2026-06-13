import { buildApp } from "./app";
import { getConfig } from "./config";

const start = async (): Promise<void> => {
  let config;
  try {
    config = getConfig();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const app = await buildApp({ baseUrl: config.BASE_URL });

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
