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

  // Check for protected routes
  const pathname = event.url.pathname;

  // Admin routes protection
  if (pathname.startsWith('/backoffice/admin')) {
    if (!event.locals.user || event.locals.user.role !== 'admin') {
      if (event.request.headers.get('accept')?.includes('application/json')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      return Response.redirect(new URL('/login', event.url), 302);
    }
  }

  // Parish routes protection
  if (pathname.startsWith('/backoffice/parish')) {
    if (!event.locals.user || event.locals.user.role !== 'parish') {
      if (event.request.headers.get('accept')?.includes('application/json')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      return Response.redirect(new URL('/login', event.url), 302);
    }
  }

  // API routes protection
  if (pathname.startsWith('/api/backoffice/admin')) {
    if (!event.locals.user || event.locals.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  if (pathname.startsWith('/api/backoffice/parish')) {
    if (!event.locals.user || event.locals.user.role !== 'parish') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return resolve(event);
};