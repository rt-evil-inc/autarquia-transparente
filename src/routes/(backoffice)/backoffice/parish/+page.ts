import type { PageLoad } from './$types';
import type { InitiativeWithTags } from '../../../api/backoffice/parish/initiatives/+server';
import type { Parish } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { User } from '$lib/auth';

export interface ParishDashboardData {
	initiatives: InitiativeWithTags[];
	parishInfo: Parish | null;
	user: User;
}

export const load: PageLoad = async ({ fetch, parent }) => {
	try {
		// Get parent data to check authentication
		const { user } = await parent();

		// Check if user is authenticated and is a parish user
		if (!user || user.role !== 'parish') {
			throw redirect(302, '/login');
		}

		// Fetch initiatives data
		const initiativesResponse = await fetch('/api/backoffice/parish/initiatives');

		if (!initiativesResponse.ok) {
			if (initiativesResponse.status === 401) {
				throw redirect(302, '/login');
			}
			throw error(initiativesResponse.status, `Failed to load initiatives: ${initiativesResponse.statusText}`);
		}

		const initiatives: InitiativeWithTags[] = await initiativesResponse.json();

		// Fetch parish info if user has parish_id
		let parishInfo: Parish | null = null;
		if (user.parish_id) {
			const parishResponse = await fetch('/api/parishes');

			if (parishResponse.ok) {
				const parishes: Parish[] = await parishResponse.json();
				parishInfo = parishes.find((p: Parish) => p.id === user.parish_id) || null;
			}
			// Note: We don't throw an error if parish info fails to load
			// as the dashboard should still work without it
		}

		return {
			initiatives,
			parishInfo,
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