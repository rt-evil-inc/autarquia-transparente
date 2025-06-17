import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { ParishInitiativeResponse } from '../../../../../api/backoffice/parish/initiatives/[id]/+server';
import type { TagsListResponse } from '../../../../../api/tags/+server';

export const load: PageLoad = async ({ params, fetch }) => {
	const id = params.id;

	const [initiativeRes, tagsRes] = await Promise.all([
		fetch(`/api/backoffice/parish/initiatives/${id}`),
		fetch('/api/tags'),
	]);

	if (!initiativeRes.ok) {
		if (initiativeRes.status === 404) {
			error(404, 'Initiative not found');
		} else if (initiativeRes.status === 403) {
			error(403, 'Access denied');
		} else {
			error(500, 'Failed to load initiative');
		}
	}

	if (!tagsRes.ok) {
		error(500, 'Failed to load tags');
	}
	const [initiative, tags]: [ParishInitiativeResponse, TagsListResponse] = await Promise.all([
		initiativeRes.json(),
		tagsRes.json(),
	]);

	console.log('Loaded initiative:', initiative);
	return {
		initiative,
		tags,
	};
};