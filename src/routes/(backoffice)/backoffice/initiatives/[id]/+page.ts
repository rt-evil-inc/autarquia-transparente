import { error } from '@sveltejs/kit';
import type { FullInitiativeResponse } from '../../../../api/initiatives/[id]/+server';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const id = params.id;

	const initiativeRes = await fetch(`/api/initiatives/${id}`);
	const tagsRes = await fetch('/api/tags');

	if (!initiativeRes.ok) {
		if (initiativeRes.status === 404) {
			error(404, 'Initiative not found');
		} else if (initiativeRes.status === 403) {
			error(403, 'Access denied');
		} else {
			error(500, 'Failed to load initiative');
		}
	}
	const data : FullInitiativeResponse = await initiativeRes.json();
	if (!tagsRes.ok) {
		error(500, 'Failed to load tags');
	}
	const tags = await tagsRes.json();

	return { initiative: data, tags: tags };
};