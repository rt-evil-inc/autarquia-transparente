import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { queries } from '$lib/server/database';

export const GET: RequestHandler = async () => {
	try {
		const parishes = queries.getAllParishes();
		return json(parishes);
	} catch (error) {
		console.error('Error fetching parishes:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};