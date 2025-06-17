import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { queries, type Initiative } from '$lib/server/database';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export type InitiativeWithTags = Initiative & {
  tags: { id: number; name: string }[];
};

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user?.parish_id) {
		error(400, { message: 'Parish ID not found' });
	}

	const initiatives = queries.getInitiativesByParish(locals.user.parish_id);

	// Filter to only show initiatives created by this user
	const userInitiatives = initiatives.filter(initiative => initiative.created_by === locals.user!.id);

	// Get tags for each initiative
	const userInitiativesWithTags = userInitiatives.map(initiative => ({
		...initiative,
		tags: queries.getInitiativeTags(initiative.id),
	}));

  userInitiativesWithTags satisfies InitiativeWithTags[];
  return json(userInitiativesWithTags);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user?.parish_id) {
			throw error(400, { message: 'Parish ID not found' });
		}

		const contentType = request.headers.get('content-type') || '';
		let title, description, content, category, tags, status, file;

		if (contentType.includes('multipart/form-data')) {
			// Handle file upload
			const formData = await request.formData();
			title = formData.get('title') as string;
			description = formData.get('description') as string;
			content = formData.get('content') as string;
			category = formData.get('category') as string;
			status = formData.get('status') as string;
			tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
			file = formData.get('document') as File;
		} else {
			// Handle JSON data
			const data = await request.json();
			({ title, description, content, category, tags, status } = data);
		}

		if (!title) {
			throw error(400, { message: 'Title is required' });
		}

		// Validate status
		const validStatuses = ['draft', 'submitted', 'approved'];
		const initiativeStatus = validStatuses.includes(status) ? status : 'draft';

		// Set submission date if status is submitted or approved
		const submissionDate = initiativeStatus === 'submitted' || initiativeStatus === 'approved' ? (new Date).toISOString() : null;

		// Create initiative using queries
		const initiativeId = queries.createInitiativeFull(
			title,
			description,
			content,
			locals.user.parish_id,
			category || null,
			locals.user.id,
			initiativeStatus,
			submissionDate,
		);

		// Add tags if provided
		if (tags && Array.isArray(tags) && tags.length > 0) {
			for (const tagId of tags) {
				queries.addInitiativeTag(initiativeId, tagId);
			}
		}

		// Handle file upload if provided
		if (file && file.size > 0) {
			const uploadsDir = path.join(process.cwd(), 'static', 'uploads');

			// Ensure uploads directory exists
			if (!existsSync(uploadsDir)) {
				await mkdir(uploadsDir, { recursive: true });
			}

			// Generate unique filename
			const timestamp = Date.now();
			const fileExtension = path.extname(file.name);
			const filename = `${timestamp}-${Math.random().toString(36).substring(2)}${fileExtension}`;
			const filePath = path.join(uploadsDir, filename);

			// Save file
			const arrayBuffer = await file.arrayBuffer();
			await writeFile(filePath, new Uint8Array(arrayBuffer));

			// Save document metadata to database using queries
			queries.addInitiativeDocument(
				initiativeId,
				filename,
				file.name,
				filePath,
				file.size,
				file.type,
			);
		}

		return json({ id: initiativeId, success: true });
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		console.error('Error creating initiative:', err);
		throw error(500, { message: 'Internal server error' });
	}
};