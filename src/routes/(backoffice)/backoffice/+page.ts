import type { User } from '$lib/auth';
import { error, redirect } from '@sveltejs/kit';
import type { InitiativesResponse } from '../../api/initiatives/+server';

export interface ParishDashboardData {
	initiatives: InitiativesResponse['initiatives'];
	totalCount: number;
	totalPages: number;
	currentPage: number;
	perPage: number;
	user: User;
}

export const load = async ({ fetch, parent, url, depends }) => {
	try {
		// Get parent data to check authentication
		const { user } = await parent();

		// Check if user is authenticated (no role restriction)
		if (!user) {
			throw redirect(302, '/login');
		}

		// Get pagination parameters from URL
		const page = url.searchParams.get('page');
		const searchParams = new URLSearchParams;
		if (page) searchParams.append('page', page);

		// Fetch initiatives data with pagination
		const initiativesUrl = `/api/initiatives${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
		depends('app:initiatives'); // Ensure this is cached in the app cache
		const initiativesResponse = await fetch(initiativesUrl);

		if (!initiativesResponse.ok) {
			if (initiativesResponse.status === 401) {
				throw redirect(302, '/login');
			}
			throw error(initiativesResponse.status, `Failed to load initiatives: ${initiativesResponse.statusText}`);
		}

		const initiatives: InitiativesResponse = await initiativesResponse.json();

		return {
			initiatives: initiatives.initiatives,
			totalCount: initiatives.totalCount,
			totalPages: initiatives.totalPages,
			currentPage: initiatives.currentPage,
			perPage: initiatives.perPage,
			user,
		} satisfies ParishDashboardData;
	} catch (err) {
		// Handle redirect errors by re-throwing them
		const errorObj = err as { status?: number };
		if (err && typeof err === 'object' && 'status' in err && typeof errorObj.status === 'number' && errorObj.status >= 300 && errorObj.status < 400) {
			throw err;
		}

		console.error('Error loading parish dashboard data:', err);
		throw error(500, 'Failed to load dashboard data');
	}
};