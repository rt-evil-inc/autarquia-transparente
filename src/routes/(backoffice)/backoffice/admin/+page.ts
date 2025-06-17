import type { PageLoad } from './$types';
import type { Initiative, Parish, User } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';

export interface AdminInitiativeWithDetails extends Initiative {
	parish_name: string;
	parish_code: string;
	created_by_email: string;
	tags: Array<{
		id: number;
		name: string;
		color: string;
		created_at: string;
	}>;
}

export interface AdminDashboardStats {
	totalInitiatives: number;
	approvedInitiatives: number;
	pendingInitiatives: number;
	totalParishes: number;
	totalUsers: number;
}

export interface AdminDashboardData {
	stats: AdminDashboardStats;
	recentInitiatives: AdminInitiativeWithDetails[];
	user: User;
}

export const load: PageLoad = async ({ fetch, parent }) => {
	try {
		// Get parent data to check authentication
		const { user } = await parent();

		// Check if user is authenticated and is an admin user
		if (!user || user.role !== 'admin') {
			throw redirect(302, '/login');
		}

		// Fetch initiatives and parishes data in parallel
		const [initiativesResponse, parishesResponse] = await Promise.all([
			fetch('/api/backoffice/admin/initiatives'),
			fetch('/api/parishes'),
		]);

		if (!initiativesResponse.ok) {
			if (initiativesResponse.status === 401) {
				throw redirect(302, '/login');
			}
			throw error(initiativesResponse.status, `Failed to load initiatives: ${initiativesResponse.statusText}`);
		}

		if (!parishesResponse.ok) {
			throw error(parishesResponse.status, `Failed to load parishes: ${parishesResponse.statusText}`);
		}

		const initiatives: AdminInitiativeWithDetails[] = await initiativesResponse.json();
		const parishes: Parish[] = await parishesResponse.json();

		// Calculate statistics
		const stats: AdminDashboardStats = {
			totalInitiatives: initiatives.length,
			approvedInitiatives: initiatives.filter(i => i.status === 'approved').length,
			pendingInitiatives: initiatives.filter(i => i.status === 'submitted').length,
			totalParishes: parishes.length,
			totalUsers: 0, // This would need a separate endpoint for user count
		};

		// Get recent initiatives (first 5)
		const recentInitiatives = initiatives.slice(0, 5);

		return {
			stats,
			recentInitiatives,
			user,
		} satisfies AdminDashboardData;
	} catch (err) {
		// Handle redirect errors by re-throwing them
		const errorObj = err as { status?: number };
		if (err && typeof err === 'object' && 'status' in err && typeof errorObj.status === 'number' && errorObj.status >= 300 && errorObj.status < 400) {
			throw err;
		}

		console.error('Error loading admin dashboard data:', err);
		throw error(500, 'Failed to load dashboard data');
	}
};