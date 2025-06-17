import { json } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
	// Clear the auth token cookie
	cookies.delete('auth-token', { path: '/' });

	return json({ success: true });
};