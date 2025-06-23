import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { drizzleDb } from '$lib/server/database';
import {
	initiatives,
	votes,
	initiative_tags,
	initiative_documents,
} from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { ids } = await request.json();

		if (!Array.isArray(ids) || ids.length === 0) {
			return json({ error: 'Invalid initiative IDs' }, { status: 400 });
		}

		let deletedCount = 0;
		let errors = 0;

		// Delete each initiative
		for (const id of ids) {
			try {
				// Get documents to delete physical files
				const documents = drizzleDb.select().from(initiative_documents)
					.where(eq(initiative_documents.initiative_id, id)).all();

				// Delete physical files
				for (const document of documents) {
					try {
						if (fs.existsSync(document.file_path)) {
							fs.unlinkSync(document.file_path);
						}
					} catch (fileError) {
						console.error('Error deleting file:', fileError);
					}
				}

				// Delete related data (cascade delete should handle this, but being explicit)
				drizzleDb.delete(votes).where(eq(votes.initiative_id, id)).run();
				drizzleDb.delete(initiative_tags).where(eq(initiative_tags.initiative_id, id)).run();
				drizzleDb.delete(initiative_documents).where(eq(initiative_documents.initiative_id, id)).run();

				// Delete the initiative itself
				drizzleDb.delete(initiatives).where(eq(initiatives.id, id)).run();

				deletedCount++;
			} catch (itemError) {
				console.error(`Error deleting initiative ${id}:`, itemError);
				errors++;
			}
		}

		return json({
			success: deletedCount > 0,
			deletedCount,
			errors,
			message: `Successfully deleted ${deletedCount} initiatives${errors > 0 ? ` with ${errors} errors` : ''}`,
		});
	} catch (error) {
		console.error('Error deleting initiatives:', error);
		return json({ error: 'Failed to delete initiatives' }, { status: 500 });
	}
};