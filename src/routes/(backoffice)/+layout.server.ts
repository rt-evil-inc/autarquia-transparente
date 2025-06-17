// Initialize database on first server load
import '$lib/server/init.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  if (!locals.user) {
    redirect(302, '/login');
  }
  return {
    user: locals.user,
  };
};