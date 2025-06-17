import type { Handle } from '@sveltejs/kit';
import { getUserFromToken } from '$lib/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
  // Get token from cookies
  const token = event.cookies.get('auth-token');

  if (token) {
    const user = getUserFromToken(token);
    if (user) {
      event.locals.user = user;
    }
  }

  // Check for protected routes - now all backoffice routes just need authentication
  const pathname = event.url.pathname;

  // All backoffice routes protection (no role distinction)
  if (pathname.startsWith('/backoffice')) {
    if (!event.locals.user) {
      if (event.request.headers.get('accept')?.includes('application/json')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      return Response.redirect(new URL('/login', event.url), 302);
    }
  }

  // API routes protection - all backoffice API routes just need authentication
  if (pathname.startsWith('/api/backoffice')) {
    if (!event.locals.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return resolve(event);
};