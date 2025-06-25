import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { queries } from '$lib/server/database';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	// Check if user is authenticated and has admin role
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	if (locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const { id } = params;

	if (!id || isNaN(Number(id))) {
		error(400, 'Invalid parish ID');
	}

	const parishId = Number(id);

	try {
		// Check if parish exists before deleting
		const existingParish = queries.getParishById(parishId);
		if (!existingParish) {
			error(404, 'Parish not found');
		}

		queries.deleteParish(parishId);
		return json({ success: true });
	} catch (err) {
		console.error('Error deleting parish:', err);
		error(500, 'Internal server error');
	}
};