import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { queries } from '$lib/server/database';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check if user is authenticated and has admin role
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	if (locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	try {
		const data = await request.json();
		const { name, code, type, description } = data;

		if (!name?.trim() || !code?.trim()) {
			error(400, 'Name and code are required');
		}

		const newParish = queries.createParish(
			name.trim(),
			code.trim(),
			type || 'parish',
			description?.trim(),
		);

		return json(newParish, { status: 201 });
	} catch (err) {
		console.error('Error creating parish:', err);

		// Handle specific database errors
		if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
			error(409, 'A parish with this code already exists');
		}

		error(500, 'Internal server error');
	}
};