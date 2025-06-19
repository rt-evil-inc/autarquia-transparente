// Initialize database on first server load
import { queries } from '$lib/server/database';
import '$lib/server/init.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	// Load global info
	const parishes = queries.getAllParishes();
	return {
		user: locals.user,
		parishes: parishes,
	};
};