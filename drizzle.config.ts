import { defineConfig } from 'drizzle-kit';

export const config = {
	out: './drizzle',
	schema: './src/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
} as const;
export default defineConfig(config);