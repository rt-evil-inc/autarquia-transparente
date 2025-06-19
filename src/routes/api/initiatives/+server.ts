import { queries } from '$lib/server/database';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export type InitiativesResponse = ((
	ReturnType<typeof queries.searchInitiatives>[0] |
	ReturnType<typeof queries.searchInitiativesWithTag>[0]
	) & {
	tags: ReturnType<typeof queries.getInitiativeTags>;
	votes: ReturnType<typeof queries.getInitiativeVotes>;
})[];

export const GET: RequestHandler = async ({ url }) => {
	const searchParams = url.searchParams;
	const search = searchParams.get('search');
	const parish = searchParams.get('parish');
	const tag = searchParams.get('tag');

	// Prepare search parameters
	const searchTerm = search ? `%${search}%` : null;

	const initiatives = tag ? queries.searchInitiativesWithTag(searchTerm, tag, parish) : queries.searchInitiatives(searchTerm, parish);

	// Get tags and votes for each initiative
	const initiativesWithTagsAndVotes = initiatives.map(initiative => ({
		...initiative,
		tags: queries.getInitiativeTags(initiative.id),
		votes: queries.getInitiativeVotes(initiative.id),
	}));
	initiativesWithTagsAndVotes satisfies InitiativesResponse;
	return json(initiativesWithTagsAndVotes);
};