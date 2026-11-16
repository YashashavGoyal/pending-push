import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

const runMigration = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL database for migration...');
  const migrationClient = postgres(dbUrl, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    console.log('⏳ Running migrations from ./drizzle folder...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
};

runMigration();
