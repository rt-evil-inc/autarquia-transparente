import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { queries, type Initiative } from '$lib/server/database';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchParams = url.searchParams;
		const search = searchParams.get('search');
		const parish = searchParams.get('parish');
		const category = searchParams.get('category');
		const tag = searchParams.get('tag');

		// Prepare search parameters
		const searchTerm = search ? `%${search}%` : null;

		const initiatives = tag ? queries.searchInitiativesWithTag(searchTerm, tag, parish, category) : queries.searchInitiatives(searchTerm, parish, category);

		// Get tags for each initiative

		const initiativesWithTags = initiatives.map(initiative => ({
			...initiative,
			tags: queries.getInitiativeTags(initiative.id),
		}));

		return json(initiativesWithTags);
	} catch (error) {
		console.error('Error fetching initiatives:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};