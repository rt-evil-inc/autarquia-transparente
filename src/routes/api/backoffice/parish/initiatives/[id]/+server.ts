import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { queries } from '$lib/server/database';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Type definitions
export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface InitiativeDocument {
  id: number;
  initiative_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface Vote {
  id: number;
  initiative_id: number;
  voter_name: string;
  voter_role: string;
  vote_type: 'approve' | 'reject';
  comments?: string;
  voted_at: string;
}

export interface ParishInitiativeResponse {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  parish_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  parish_name: string;
  parish_code: string;
  tags: Tag[];
  documents: InitiativeDocument[];
  votes: Vote[];
}

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { id } = params;

	if (!id || isNaN(Number(id))) {
		error(400, { message: 'Invalid initiative ID' });
	}

	if (!locals.user) {
		error(401, { message: 'Authentication required' });
	}

	const contentType = request.headers.get('content-type') || '';
	let title, description, content, category, tags, status, votes, file;

	if (contentType.includes('multipart/form-data')) {
		// Handle file upload
		const formData = await request.formData();
		title = formData.get('title') as string;
		description = formData.get('description') as string;
		content = formData.get('content') as string;
		category = formData.get('category') as string;
		status = formData.get('status') as string;
		tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
		votes = formData.get('votes') ? JSON.parse(formData.get('votes') as string) : [];
		file = formData.get('document') as File;
	} else {
		// Handle JSON data
		const data = await request.json();
		({ title, description, content, category, tags, status, votes } = data);
	}

	if (!title) {
		error(400, { message: 'Title is required' });
	}

	// Check if initiative exists (no ownership verification)
	const existing = queries.getInitiativeById(Number(id));

	if (!existing) {
		error(404, { message: 'Initiative not found' });
	}

	// Validate status
	const validStatuses = ['draft', 'submitted', 'approved'];
	const initiativeStatus = validStatuses.includes(status) ? status : existing.status;

	// Set submission date if status is changing to submitted or approved
	let submissionDate = null;
	if ((initiativeStatus === 'submitted' || initiativeStatus === 'approved') && existing.status === 'draft') {
		submissionDate = (new Date).toISOString();
	}

	// Update initiative using queries
	queries.updateInitiativeFull(
		Number(id),
		title,
		description,
		content,
		category,
		initiativeStatus,
		submissionDate,
	);

	// Update tags - clear existing and add new ones
	queries.clearInitiativeTags(Number(id));

	if (tags && Array.isArray(tags) && tags.length > 0) {
		for (const tagId of tags) {
			queries.addInitiativeTag(Number(id), tagId);
		}
	}

	// Update votes - clear existing and add new ones
	if (votes && Array.isArray(votes)) {
		queries.clearInitiativeVotes(Number(id));

		for (const vote of votes) {
			// Only add votes that have a voter name
			if (vote.voter_name && vote.voter_name.trim()) {
				queries.addVote(
					Number(id),
					vote.voter_name.trim(),
					vote.vote,
					vote.notes || undefined,
				);
			}
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
			Number(id),
			filename,
			file.name,
			filePath,
			file.size,
			file.type,
		);
	}

	return json({ success: true });
};