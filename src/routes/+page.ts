import type { Parish, Tag } from '$lib/server/database';
import { error } from '@sveltejs/kit';
import type { InitiativesResponse } from './api/initiatives/+server.js';

export interface InitiativeListData {
  initiatives: InitiativesResponse['initiatives'];
  parishes: Parish[];
  tags: Tag[];
}

export const load = async ({ url, fetch }) => {
	// Build query parameters from URL search params
	const searchParams = new URLSearchParams;

	const searchTerm = url.searchParams.get('search');
	const parish = url.searchParams.get('parish');
	const category = url.searchParams.get('category');
	const tag = url.searchParams.get('tag');
	const page = url.searchParams.get('page');

	if (searchTerm) searchParams.append('search', searchTerm);
	if (parish) searchParams.append('parish', parish);
	if (category) searchParams.append('category', category);
	if (tag) searchParams.append('tag', tag);
	if (page) searchParams.append('page', page);

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

	const [initiativesData, parishes, tags]: [InitiativesResponse, Parish[], Tag[]] = await Promise.all([
		initiativesResponse.json(),
		parishesResponse.json(),
		tagsResponse.json(),
	]);

	return {
		initiatives: initiativesData.initiatives,
		totalCount: initiativesData.totalCount,
		totalPages: initiativesData.totalPages,
		currentPage: initiativesData.currentPage,
		perPage: initiativesData.perPage,
		parishes,
		tags,
		// Current filter values from URL
		filters: {
			searchTerm: searchTerm || '',
			selectedParish: parish || '',
			selectedCategory: category || '',
			selectedTag: tag || '',
			page: page ? parseInt(page, 10) : 1,
		},
	};
};