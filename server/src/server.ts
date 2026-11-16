import { createApp } from './app.js';
import { config } from './config/env.js';

const startServer = async () => {
  try {
    const app = await createApp();
    await app.listen({
      port: config.port,
      host: config.host,
    });
    console.log(`⚡ Fastify Engine running at http://${config.host}:${config.port}`);
    console.log(`📖 Swagger API Docs available at http://${config.host}:${config.port}/documentation`);
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
