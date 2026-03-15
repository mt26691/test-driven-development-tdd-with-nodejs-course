import { buildApp } from "./app";

const start = async (): Promise<void> => {
  const app = await buildApp();

  try {
    await app.listen({ port: 3000 });
    app.log.info(`Documentation at http://localhost:3000/documentation`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
