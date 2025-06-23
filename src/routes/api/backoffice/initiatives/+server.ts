import { uploadsDir } from '$lib/config';
import { queries, type Initiative } from '$lib/server/database';
import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import type { NewVote } from '../../../../db/schema';

export const DELETE: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		error(401, { message: 'Authentication required' });
	}

	// Check if user has admin privileges (optional - adjust based on your auth system)
	// You might want to add additional checks here for who can delete all initiatives

	try {
		const result = queries.deleteAllInitiatives();

		if (result.deleted > 0 || result.errors === 0) {
			return json({
				success: true,
				message: `Successfully deleted ${result.deleted} initiatives`,
				deleted: result.deleted,
				errors: result.errors,
			});
		} else {
			return json({
				success: false,
				message: 'Failed to delete initiatives',
				deleted: result.deleted,
				errors: result.errors,
			}, { status: 500 });
		}
	} catch (err) {
		console.error('Error in DELETE /api/backoffice/initiatives:', err);
		error(500, { message: 'Internal server error' });
	}
};

// Type guard functions
function isValidInitiativeStatus(status: string): status is InitiativeStatus {
	return ['draft', 'submitted', 'approved', 'rejected'].includes(status);
}

function isValidProposalType(type: string): type is ProposalType {
	return ['proposal', 'amendment'].includes(type);
}

function isValidMeetingType(type: string): type is MeetingType {
	return ['public', 'private', 'extraordinary'].includes(type);
}

function isValidVoteType(vote: string): vote is VoteType {
	return ['favor', 'against', 'abstention'].includes(vote);
}

export type InitiativeStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type ProposalType = 'proposal' | 'amendment';
export type MeetingType = 'public' | 'private' | 'extraordinary';
export type VoteType = 'favor' | 'against' | 'abstention';

export type VoteData = Omit<NewVote, 'initiative_id'>;
export type InitiativeWithTags = Initiative & {
  tags: { id: number; name: string }[];
};

export type InitiativeCreateData = {
  title: string;
  description: string;
  content: string;
  tags: string[];
  status: InitiativeStatus;
  parish_id: number;
  proposal_number: string | null;
  proposal_type: ProposalType | null;
  meeting_number: number | null;
  meeting_date: string | null;
  meeting_type: MeetingType | null;
  meeting_notes: string | null;
  votes: VoteData[];
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, { message: 'Authentication required' });
	}

	const contentType = request.headers.get('content-type') || '';
	let title: string;
	let description: string;
	let content: string;
	let tags: string[];
	let status: InitiativeStatus;
	let file: File | null = null;
	let parishId: string | number;
	let proposalNumber: string | null;
	let proposalType: ProposalType | null;
	let meetingNumber: number | null;
	let meetingDate: string | null;
	let meetingType: MeetingType | null;
	let meetingNotes: string | null;
	let proposalFile: File | null = null;
	let coverImageFile: File | null = null;
	let votes: VoteData[] = [];

	if (contentType.includes('multipart/form-data')) {
		// Handle file upload
		const formData = await request.formData();
		title = formData.get('title') as string;
		description = formData.get('description') as string;
		content = formData.get('content') as string;

		const statusValue = formData.get('status') as string;
		if (!isValidInitiativeStatus(statusValue)) {
			error(400, { message: 'Invalid status value' });
		}
		status = statusValue;

		parishId = formData.get('parish_id') as string;
		tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
		file = formData.get('document') as File;
		proposalFile = formData.get('proposalDocument') as File;
		coverImageFile = formData.get('coverImage') as File;

		// Meeting fields
		proposalNumber = formData.get('proposalNumber') as string || null;

		const proposalTypeValue = formData.get('proposalType') as string;
		proposalType = proposalTypeValue && isValidProposalType(proposalTypeValue) ? proposalTypeValue : null;

		meetingNumber = formData.get('meetingNumber') ? Number(formData.get('meetingNumber')) : null;
		meetingDate = formData.get('meetingDate') as string || null;

		const meetingTypeValue = formData.get('meetingType') as string;
		meetingType = meetingTypeValue && isValidMeetingType(meetingTypeValue) ? meetingTypeValue : null;

		meetingNotes = formData.get('meetingNotes') as string || null;

		// Parse votes if provided
		const votesData = formData.get('votes');
		if (votesData) {
			try {
				const parsedVotes = JSON.parse(votesData as string) as VoteData[];
				votes = parsedVotes.filter(vote => vote.voter_name && vote.voter_name.trim() && vote.vote && isValidVoteType(vote.vote));
			} catch (e) {
				console.error('Error parsing votes:', e);
				votes = [];
			}
		}
	} else {
		// Handle JSON data
		const data: InitiativeCreateData = await request.json();
		({
			title,
			description,
			content,
			tags,
			status,
			parish_id: parishId,
			proposal_number: proposalNumber,
			proposal_type: proposalType,
			meeting_number: meetingNumber,
			meeting_date: meetingDate,
			meeting_type: meetingType,
			meeting_notes: meetingNotes,
			votes = [],
		} = data);

		// Validate votes from JSON data
		if (votes && votes.length > 0) {
			votes = votes.filter(vote => vote.voter_name && vote.voter_name.trim() && vote.vote && isValidVoteType(vote.vote));
		}
	}

	if (!title) {
		error(400, { message: 'Title is required' });
	}

	// Use provided parish_id or user's parish_id as fallback
	const targetParishId = parishId ? Number(parishId) : locals.user.parish_id || 1; // Default to parish 1 if no parish_id

	// Set submission date if status is submitted or approved
	const submissionDate = status === 'submitted' || status === 'approved' ? (new Date).toISOString() : null;

	const dbtags = tags.map(tag => {
		return queries.getTagByName(tag);
	}).filter(tag => tag !== null);

	// Handle cover image upload if provided
	let coverImagePath: string | null = null;
	if (coverImageFile && coverImageFile.size > 0) {
		// Validate file type
		if (!coverImageFile.type.startsWith('image/')) {
			error(400, { message: 'Cover image must be an image file' });
		}

		// Ensure uploads directory exists
		if (!existsSync(uploadsDir)) {
			await mkdir(uploadsDir, { recursive: true });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const fileExtension = path.extname(coverImageFile.name);
		const filename = `cover-${timestamp}-${Math.random().toString(36).substring(2)}${fileExtension}`;
		const filePath = path.join(uploadsDir, filename);

		// Save file
		const arrayBuffer = await coverImageFile.arrayBuffer();
		await writeFile(filePath, new Uint8Array(arrayBuffer));

		coverImagePath = filename; // Store just the filename for the database
	}

	// Create initiative using queries
	const initiativeId = queries.createInitiativeFull({
		title,
		description,
		content,
		parish_id: targetParishId,
		created_by: locals.user.id,
		status: status,
		submission_date: submissionDate,
		proposal_number: proposalNumber,
		proposal_type: proposalType,
		meeting_number: meetingNumber,
		meeting_date: meetingDate,
		meeting_type: meetingType,
		meeting_notes: meetingNotes,
		cover_image: coverImagePath,
	}, dbtags.map(tag => tag.id));

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

	// Handle votes if provided
	if (votes && votes.length > 0) {
		votes.forEach(vote => {
			queries.addVote(initiativeId, vote.voter_name, vote.vote, vote.notes ?? undefined);
		});
	}

	return json({ id: initiativeId, success: true });
};