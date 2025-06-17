import type { InitiativeWithParish, Parish, Tag } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export interface InitiativeListData {
  initiatives: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    parish: {
      name: string;
      code: string;
    };
    tags: Array<{
      id: number;
      name: string;
      color: string;
    }>;
  }>;
  parishes: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

export const load = async ({ url, fetch }) => {
	// Build query parameters from URL search params
	const searchParams = new URLSearchParams;

	const searchTerm = url.searchParams.get('search');
	const parish = url.searchParams.get('parish');
	const category = url.searchParams.get('category');
	const tag = url.searchParams.get('tag');

	if (searchTerm) searchParams.append('search', searchTerm);
	if (parish) searchParams.append('parish', parish);
	if (category) searchParams.append('category', category);
	if (tag) searchParams.append('tag', tag);

	// Load initiatives with filters
	const initiativesUrl = `/api/initiatives${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
	const initiativesResponse = await fetch(initiativesUrl);

	if (!initiativesResponse.ok) {
		throw error(500, 'Failed to load initiatives');
	}

	// Load parishes and tags for filters
	const [parishesResponse, tagsResponse] = await Promise.all([
		fetch('/api/parishes'),
		fetch('/api/tags'),
	]);

	if (!parishesResponse.ok || !tagsResponse.ok) {
		throw error(500, 'Failed to load filter data');
	}

	const [initiatives, parishes, tags]:[(InitiativeWithParish & { tags: Tag[] })[], Parish[], Tag[]] = await Promise.all([
		initiativesResponse.json(),
		parishesResponse.json(),
		tagsResponse.json(),
	]);

	return {
		initiatives,
		parishes,
		tags,
		// Current filter values from URL
		filters: {
			searchTerm: searchTerm || '',
			selectedParish: parish || '',
			selectedCategory: category || '',
			selectedTag: tag || '',
		},
	};
};