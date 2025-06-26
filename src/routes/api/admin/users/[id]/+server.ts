import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { queries as db } from '$lib/server/database';

export const GET: RequestHandler = async ({ locals, params }) => {
	// Check if user is authenticated and is an admin
	if (!locals.user || locals.user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	const userId = parseInt(params.id!);
	if (isNaN(userId)) {
		return error(400, 'ID de utilizador inválido');
	}

	const user = db.getUserById(userId);
	if (!user) {
		return error(404, 'Utilizador não encontrado');
	}

	// Remove password_hash from response for security
	const safeUser = {
		id: user.id,
		email: user.email,
		role: user.role,
		parish_id: user.parish_id,
		created_at: user.created_at,
		is_active: user.is_active,
		updated_at: user.updated_at,
	};

	return json(safeUser);
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	// Check if user is authenticated and is an admin
	if (!locals.user || locals.user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	const userId = parseInt(params.id!);
	if (isNaN(userId)) {
		return error(400, 'ID de utilizador inválido');
	}

	const updates = await request.json();

	// Validate that the user exists
	const existingUser = db.getUserById(userId);
	if (!existingUser) {
		return error(404, 'Utilizador não encontrado');
	}

	// Validate allowed fields
	const allowedFields = ['email', 'role', 'parish_id', 'is_active'];
	const validUpdates: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(updates)) {
		if (allowedFields.includes(key)) {
			validUpdates[key] = value;
		}
	}

	// Validate specific fields if they're being updated
	if ('email' in validUpdates && typeof validUpdates.email === 'string') {
		// Check if email already exists for another user
		const emailUser = db.getUserByEmail(validUpdates.email);
		if (emailUser && emailUser.id !== userId) {
			return error(409, 'Email já está em uso por outro utilizador');
		}
	}

	if ('role' in validUpdates && typeof validUpdates.role === 'string') {
		if (!['admin', 'parish'].includes(validUpdates.role)) {
			return error(400, 'Tipo de utilizador deve ser admin ou parish');
		}
	}

	if ('parish_id' in validUpdates && validUpdates.parish_id !== null && typeof validUpdates.parish_id === 'number') {
		// Validate that the parish exists
		const parish = db.getParishById(validUpdates.parish_id);
		if (!parish) {
			return error(400, 'Freguesia não encontrada');
		}
	}

	try {
		const updatedUser = db.updateUser(userId, validUpdates);

		if (!updatedUser) {
			return error(500, 'Falha ao atualizar utilizador');
		}

		// Remove password_hash from response for security
		const safeUser = {
			id: updatedUser.id,
			email: updatedUser.email,
			role: updatedUser.role,
			parish_id: updatedUser.parish_id,
			created_at: updatedUser.created_at,
			is_active: updatedUser.is_active,
			updated_at: updatedUser.updated_at,
		};

		return json(safeUser);
	} catch (err) {
		console.error('Error updating user:', err);
		return error(500, 'Erro interno do servidor');
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	// Check if user is authenticated and is an admin
	if (!locals.user || locals.user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	const userId = parseInt(params.id!);
	if (isNaN(userId)) {
		return error(400, 'ID de utilizador inválido');
	}

	// Prevent admin from deleting themselves
	if (userId === locals.user.id) {
		return error(400, 'Não é possível eliminar o próprio utilizador');
	}

	const user = db.getUserById(userId);
	if (!user) {
		return error(404, 'Utilizador não encontrado');
	}

	try {
		// For now, we'll just set the user as inactive instead of hard delete
		// to preserve data integrity
		const updatedUser = db.updateUser(userId, { is_active: false });

		if (!updatedUser) {
			return error(500, 'Falha ao desativar utilizador');
		}

		return json({ message: 'Utilizador desativado com sucesso' });
	} catch (err) {
		console.error('Error deactivating user:', err);
		return error(500, 'Erro interno do servidor');
	}
};