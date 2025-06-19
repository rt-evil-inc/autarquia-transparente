import { defineConfig } from 'drizzle-kit';
export const config = {
	out: './drizzle',
	schema: './src/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: './data/portal-autarca.db',
	},
} as const;
export default defineConfig(config);