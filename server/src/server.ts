import { createApp } from './app.js';
import { config } from './config/env.js';
import { client } from './db/index.js';

const startServer = async () => {
  try {
    const app = await createApp();
    await app.listen({
      port: config.port,
      host: config.host,
    });
    console.log(`⚡ Fastify Engine running at http://${config.host}:${config.port}`);
    console.log(`📖 Swagger API Docs available at http://${config.host}:${config.port}/documentation`);

    // Graceful Shutdown Handlers (handles SIGINT / SIGTERM for zero-downtime restarts)
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);
        try {
          await app.close();
          console.log('⚡ Fastify server closed.');
          await client.end({ timeout: 5 });
          console.log('🔌 PostgreSQL connection pool terminated cleanly.');
          process.exit(0);
        } catch (err) {
          console.error('Error during graceful shutdown:', err);
          process.exit(1);
        }
      });
    }
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
