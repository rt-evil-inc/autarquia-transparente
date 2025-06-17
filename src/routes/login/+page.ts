import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { user } = await parent();

	// Redirect if already logged in
	if (user) {
		if (user.role === 'admin') {
			redirect(302, '/backoffice/admin');
		} else if (user.role === 'parish') {
			redirect(302, '/backoffice');
		} else {
			redirect(302, '/');
		}
	}

	return {};
};