import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import { config } from '../config/env.js';

let client: postgres.Sql;

if (config.databaseUrl) {
  client = postgres(config.databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
} else {
  // Fallback dummy for initialization before DATABASE_URL is set
  client = postgres('postgres://localhost:5432/pending_push', { max: 1 });
}

export const db = drizzle(client, { schema });
export { client };
