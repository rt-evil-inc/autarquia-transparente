import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { queries as db } from '$lib/server/database';

export const GET: RequestHandler = async ({ locals }) => {
	// Check if user is authenticated (no role restriction)
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const users = db.getAllUsers();

		// Remove password_hash from response for security
		const safeUsers = users.map(user => ({
			id: user.id,
			email: user.email,
			role: user.role,
			parish_id: user.parish_id,
			created_at: user.created_at,
		}));

		return json(safeUsers);
	} catch (error) {
		console.error('Error fetching users:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check if user is authenticated (no role restriction)
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { email, password, role, parish_id } = await request.json();

		if (!email || !password || !role) {
			return json({ error: 'Email, password, and role are required' }, { status: 400 });
		}

		if (!['admin', 'parish'].includes(role)) {
			return json({ error: 'Role must be admin or parish' }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = db.getUserByEmail(email);
		if (existingUser) {
			return json({ error: 'User with this email already exists' }, { status: 409 });
		}

		// Hash password (in a real app, use bcrypt or similar)
		const bcrypt = await import('bcrypt');
		const password_hash = await bcrypt.hash(password, 10);

		// Create user
		db.createUser(email, password_hash, role, parish_id);

		return json({ message: 'User created successfully' }, { status: 201 });
	} catch (error) {
		console.error('Error creating user:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};