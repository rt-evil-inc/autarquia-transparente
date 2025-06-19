import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { queries, type Initiative } from '$lib/server/database';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { uploadsDir } from '$lib/config';

export type InitiativeWithTags = Initiative & {
  tags: { id: number; name: string }[];
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, { message: 'Authentication required' });
	}

	const contentType = request.headers.get('content-type') || '';
	let title, description, content, category, tags, status, file, parishId;
	let proposalNumber, proposalType, meetingNumber, meetingDate, meetingType, meetingNotes, proposalFile;

	if (contentType.includes('multipart/form-data')) {
		// Handle file upload
		const formData = await request.formData();
		title = formData.get('title') as string;
		description = formData.get('description') as string;
		content = formData.get('content') as string;
		category = formData.get('category') as string;
		status = formData.get('status') as string;
		parishId = formData.get('parish_id') as string;
		tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
		file = formData.get('document') as File;
		proposalFile = formData.get('proposalDocument') as File;

		// Meeting fields
		proposalNumber = formData.get('proposalNumber') as string || null;
		proposalType = formData.get('proposalType') as string || null;
		meetingNumber = formData.get('meetingNumber') ? Number(formData.get('meetingNumber')) : null;
		meetingDate = formData.get('meetingDate') as string || null;
		meetingType = formData.get('meetingType') as string || null;
		meetingNotes = formData.get('meetingNotes') as string || null;
	} else {
		// Handle JSON data
		const data = await request.json();
		({
			title,
			description,
			content,
			category,
			tags,
			status,
			parish_id: parishId,
			proposal_number: proposalNumber,
			proposal_type: proposalType,
			meeting_number: meetingNumber,
			meeting_date: meetingDate,
			meeting_type: meetingType,
			meeting_notes: meetingNotes,
		} = data);
	}

	if (!title) {
		error(400, { message: 'Title is required' });
	}

	// Use provided parish_id or user's parish_id as fallback
	const targetParishId = parishId ? Number(parishId) : locals.user.parish_id || 1; // Default to parish 1 if no parish_id

	// Validate status
	const validStatuses = ['draft', 'submitted', 'approved'];
	const initiativeStatus = validStatuses.includes(status) ? status : 'draft';

	// Set submission date if status is submitted or approved
	const submissionDate = initiativeStatus === 'submitted' || initiativeStatus === 'approved' ? (new Date).toISOString() : null;

	// Create initiative using queries
	const initiativeId = queries.createInitiativeFull({
		title,
		description,
		content,
		parish_id: targetParishId,
		category: category || null,
		created_by: locals.user.id,
		status: initiativeStatus,
		submission_date: submissionDate,
		proposal_number: proposalNumber,
		proposal_type: proposalType,
		meeting_number: meetingNumber,
		meeting_date: meetingDate,
		meeting_type: meetingType,
		meeting_notes: meetingNotes,
	});

	// Add tags if provided
	if (tags && Array.isArray(tags) && tags.length > 0) {
		for (const tagId of tags) {
			queries.addInitiativeTag(initiativeId, tagId);
		}
	}

	// Handle file upload if provided
	if (file && file.size > 0) {
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

	// Handle proposal document upload if provided (already extracted from formData above)
	if (proposalFile && proposalFile.size > 0) {
		// Ensure uploads directory exists
		if (!existsSync(uploadsDir)) {
			await mkdir(uploadsDir, { recursive: true });
		}

		// Generate unique filename with proposal prefix
		const timestamp = Date.now();
		const fileExtension = path.extname(proposalFile.name);
		const filename = `proposal-${timestamp}-${Math.random().toString(36).substring(2)}${fileExtension}`;
		const filePath = path.join(uploadsDir, filename);

		// Save file
		const arrayBuffer = await proposalFile.arrayBuffer();
		await writeFile(filePath, new Uint8Array(arrayBuffer));

		// Save document metadata to database
		queries.addInitiativeDocument(
			initiativeId,
			filename,
			`Proposta: ${proposalFile.name}`, // Mark as proposal document
			filePath,
			proposalFile.size,
			proposalFile.type,
		);
	}

	return json({ id: initiativeId, success: true });
};