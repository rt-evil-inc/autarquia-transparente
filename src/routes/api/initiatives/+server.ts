import { queries } from '$lib/server/database';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export type InitiativesResponse = {
	initiatives: (ReturnType<typeof queries.searchInitiatives>[0] & {
		tags: ReturnType<typeof queries.getInitiativeTags>;
		votes: ReturnType<typeof queries.getInitiativeVotes>;
	})[];
	totalCount: number;
	currentPage: number;
	totalPages: number;
	perPage: number;
};

export const GET: RequestHandler = async ({ url }) => {
	const searchParams = url.searchParams;
	const search = searchParams.get('search');
	const parish = searchParams.get('parish');
	const tag = searchParams.get('tag');
	const page = parseInt(searchParams.get('page') || '1', 10);
	const perPage = 24;

	// Prepare search parameters
	const searchTerm = search ? `%${search}%` : null;

	// Get all initiatives first to count total
	const allInitiatives = queries.searchInitiatives(searchTerm, parish, tag);

	const totalCount = allInitiatives.length;
	const totalPages = Math.ceil(totalCount / perPage);
	const offset = (page - 1) * perPage;

	// Slice for pagination
	const paginatedInitiatives = allInitiatives.slice(offset, offset + perPage);

	// Get tags and votes for each initiative
	const initiativesWithTagsAndVotes = paginatedInitiatives.map(initiative => ({
		...initiative,
		tags: queries.getInitiativeTags(initiative.id),
		votes: queries.getInitiativeVotes(initiative.id),
	}));

	const response: InitiativesResponse = {
		initiatives: initiativesWithTagsAndVotes,
		totalCount,
		currentPage: page,
		totalPages,
		perPage,
	};

	return json(response);
};