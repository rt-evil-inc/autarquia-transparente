import type { PageLoad } from './$types';
import type { Initiative, Parish, User } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { User as AuthUser } from '$lib/auth';

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
	users: User[];
	parishes: Parish[];
	user: AuthUser;
}

export const load: PageLoad = async ({ fetch, parent }) => {
	try {
		// Get parent data to check authentication
		const { user } = await parent();

		// Check if user is authenticated (no role restriction)
		if (!user) {
			throw redirect(302, '/login');
		}

		// Fetch initiatives, parishes, and users data in parallel
		const [initiativesResponse, parishesResponse, usersResponse] = await Promise.all([
			fetch('/api/backoffice/admin/initiatives'),
			fetch('/api/parishes'),
			fetch('/api/admin/users'),
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

		if (!usersResponse.ok) {
			throw error(usersResponse.status, `Failed to load users: ${usersResponse.statusText}`);
		}

		const initiatives: AdminInitiativeWithDetails[] = await initiativesResponse.json();
		const parishes: Parish[] = await parishesResponse.json();
		const users: User[] = await usersResponse.json();

		// Calculate statistics
		const stats: AdminDashboardStats = {
			totalInitiatives: initiatives.length,
			approvedInitiatives: initiatives.filter(i => i.status === 'approved').length,
			pendingInitiatives: initiatives.filter(i => i.status === 'submitted').length,
			totalParishes: parishes.length,
			totalUsers: users.length,
		};

		// Get recent initiatives (first 5)
		const recentInitiatives = initiatives.slice(0, 5);

		return {
			stats,
			recentInitiatives,
			users,
			parishes,
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