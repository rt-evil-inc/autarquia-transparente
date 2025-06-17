// Initialize database on first server load
import '$lib/server/init.js';

export const load = async ({ locals }) => {
	return {
		user: locals.user || null,
	};
};