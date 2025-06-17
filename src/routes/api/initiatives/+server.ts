import { queries } from '$lib/server/database';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
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
};