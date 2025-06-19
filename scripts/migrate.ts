import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { config } from '../drizzle.config';
const sqlite = new Database(config.dbCredentials.url);
export const db = drizzle({ client: sqlite });

console.log('Running migrations...');
migrate(db, { migrationsFolder: config.out });
console.log('Migrations completed successfully.');