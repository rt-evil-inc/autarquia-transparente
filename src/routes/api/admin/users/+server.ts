import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { queries as db } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	// Check if user is authenticated (no role restriction)
	if (!locals.user) {
		return error(401, 'Unauthorized');
	}

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
};

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check if user is authenticated (no role restriction)
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const { email, password, role, parish_id } = await request.json();

	if (!email || !password || !role) {
		error(400, 'Email, password, and role are required');
	}

	if (!['admin', 'parish'].includes(role)) {
		error(400, 'Role must be admin or parish');
	}

	// Check if user already exists
	const existingUser = db.getUserByEmail(email);
	if (existingUser) {
		error(409, 'User with this email already exists');
	}

	// Hash password (in a real app, use bcrypt or similar)
	const bcrypt = await import('bcrypt');
	const password_hash = await bcrypt.hash(password, 10);

	// Create user
	db.createUser(email, password_hash, role, parish_id);

	return json({ message: 'User created successfully' }, { status: 201 });
};