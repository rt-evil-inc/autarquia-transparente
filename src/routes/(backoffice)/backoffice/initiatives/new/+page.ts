import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { TagsListResponse } from '../../../../api/tags/+server';

export const load: PageLoad = async ({ fetch }) => {
	const tagsRes = await fetch('/api/tags');

	if (!tagsRes.ok) {
		error(500, 'Failed to load tags');
	}

	const tags: TagsListResponse = await tagsRes.json();

	return {
		tags,
	};
};