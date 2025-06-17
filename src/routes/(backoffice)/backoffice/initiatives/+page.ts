import type { InitiativeWithTags } from '../../../api/backoffice/parish/initiatives/+server';
import type { PageLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export interface ParishInitiative {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  parish_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  submission_date: string | null;
  parish_name: string;
  parish_code: string;
  tags: Array<{
    id: number;
    name: string;
    color: string;
    created_at: string;
  }>;
}

export interface ParishInitiativesData {
  initiatives: InitiativeWithTags[];
}

export const load: PageLoad = async ({ fetch, parent }) => {
	// Get parent data to check authentication
	const { user } = await parent();

	// Check if user is authenticated (no role restriction)
	if (!user) {
		redirect(302, '/login');
	}

	// Fetch initiatives data
	const response = await fetch('/api/backoffice/parish/initiatives');

	if (!response.ok) {
		if (response.status === 401) {
			redirect(302, '/login');
		}
		error(response.status, `Failed to load initiatives: ${response.statusText}`);
	}

	const initiatives: InitiativeWithTags[] = await response.json();

	return {
		initiatives,
	} satisfies ParishInitiativesData;
};