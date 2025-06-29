import bcrypt from 'bcrypt';
import { Database } from 'bun:sqlite';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import fs from 'fs';
import {
	initiative_documents,
	initiative_tags,
	initiatives,
	parishes,
	tags,
	users,
	votes,
	type InitiativeDocument,
	type NewInitiative,
	type Parish,
	type Tag,
	// Import types from schema
	type User,
	type Vote,
} from '../../db/schema';

import { env } from '$env/dynamic/private';

// Initialize database
export const db = new Database(env.DATABASE_URL);
export const drizzleDb = drizzle(db);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Re-export types for backward compatibility
export type { FullInitiative, Initiative, InitiativeWithParish } from '../../db/schema.js';
export type { InitiativeDocument, Parish, Tag, User, Vote };

// Create tables
export function initializeDatabase() {
	// Enable foreign keys
	db.exec('PRAGMA foreign_keys = ON');
	console.log('Database initialized with foreign keys enabled');
}

// Seed initial data
export async function seedDatabase() {
	try {
		console.log('Starting database seeding...');

		// Create default parishes
		const parishData = [
			{ name: 'Lumiar', code: 'lumiar', description: 'Freguesia do Lumiar' },
			{ name: 'Penha de França', code: 'penha-franca', description: 'Freguesia de Penha de França' },
		];

		console.log('Creating parishes...');
		for (const parish of parishData) {
			console.log(`Inserting parish: ${parish.name}`);
			await drizzleDb.insert(parishes).values({ ...parish, type: 'parish' }).onConflictDoNothing();
		}
		console.log('Parishes created successfully');

		const autarchyData = [
			{ name: 'Câmara Municipal', code: 'camara-municipal', description: 'Autarquia da Câmara Municipal' },
			{ name: 'Assembleia Municipal', code: 'assembleia-municipal', description: 'Autarquia da Assembleia Municipal' },
		];

		// Create default autarchies
		console.log('Creating autarchies...');
		for (const autarchy of autarchyData) {
			console.log(`Inserting autarchy: ${autarchy.name}`);
			await drizzleDb.insert(parishes).values({ ...autarchy, type: 'autarchy' }).onConflictDoNothing();
		}
		console.log('Autarchies created successfully');

		// Create default tags
		const tagData = [
			{ name: 'Finanças', color: '#10B981' },
			{ name: 'Transparência', color: '#3B82F6' },
			{ name: 'Mobilidade', color: '#F59E0B' },
			{ name: 'Segurança', color: '#EF4444' },
			{ name: 'Habitação', color: '#8B5CF6' },
			{ name: 'Património', color: '#6B7280' },
			{ name: 'Setor Empresarial do Estado', color: '#84CC16' },
		];

		console.log('Creating tags...');
		for (const tag of tagData) {
			console.log(`Inserting tag: ${tag.name}`);
			await drizzleDb.insert(tags).values(tag).onConflictDoNothing();
		}
		console.log('Tags created successfully');

		// Create admin user
		console.log('Creating admin user...');
		const adminPassword = await bcrypt.hash('admin123', 10);
		console.log('Admin password hashed');
		await drizzleDb.insert(users).values({
			email: 'admin@portal.pt',
			password_hash: adminPassword,
			role: 'admin',
		}).onConflictDoNothing();
		console.log('Admin user created successfully');

		// Create a sample parish user
		console.log('Creating parish user...');
		const parishPassword = await bcrypt.hash('parish123', 10);
		console.log('Parish password hashed');
		await drizzleDb.insert(users).values({
			email: 'parque@portal.pt',
			password_hash: parishPassword,
			role: 'parish',
			parish_id: 1,
		}).onConflictDoNothing();
		console.log('Parish user created successfully');

		console.log('Database seeded successfully');
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}

// Query functions
export const queries = {	// User functions
	getAllUsers: (): User[] => {
		return drizzleDb.select({
			id: users.id,
			email: users.email,
			role: users.role,
			parish_id: users.parish_id,
			created_at: users.created_at,
			password_hash: users.password_hash,
			is_active: users.is_active,
			updated_at: users.updated_at,
		}).from(users).orderBy(desc(users.created_at)).all();
	},

	getUserByEmail: (email: string): User | null => {
		const result = drizzleDb.select().from(users).where(eq(users.email, email)).get();
		return result || null;
	},

	getUserById: (id: number): User | null => {
		const result = drizzleDb.select().from(users).where(eq(users.id, id)).get();
		return result || null;
	},

	createUser: (email: string, password_hash: string, role: 'admin' | 'parish', parish_id?: number): void => {
		drizzleDb.insert(users).values({ email, password_hash, role, parish_id }).run();
	},

	updateUser: (id: number, updates: Partial<Pick<User, 'email' | 'role' | 'parish_id' | 'is_active'>>): User | null => {
		const result = drizzleDb.update(users)
			.set({ ...updates, updated_at: (new Date).toISOString() })
			.where(eq(users.id, id))
			.returning()
			.get();
		return result || null;
	},

	// Parish functions
	getAllParishes: (): Parish[] => {
		return drizzleDb.select().from(parishes).orderBy(parishes.name).all();
	},

	getParishById: (id: number): Parish | null => {
		const result = drizzleDb.select().from(parishes).where(eq(parishes.id, id)).get();
		return result || null;
	},

	getParishByCode: (code: string): Parish | null => {
		const result = drizzleDb.select().from(parishes).where(eq(parishes.code, code)).get();
		return result || null;
	},

	createParish: (name: string, code: string, type: 'parish' | 'autarchy' = 'parish', description?: string): Parish => {
		const result = drizzleDb.insert(parishes).values({
			name: name.trim(),
			code: code.trim(),
			type,
			description: description?.trim() || null,
		}).returning().get();
		return result;
	},

	deleteParish: (id: number): void => {
		drizzleDb.delete(parishes).where(eq(parishes.id, id)).run();
	},

	// Initiative functions
	getAllInitiatives: () => {
		return drizzleDb.select({
			id: initiatives.id,
			title: initiatives.title,
			description: initiatives.description,
			content: initiatives.content,
			parish_id: initiatives.parish_id,
			status: initiatives.status,
			submission_date: initiatives.submission_date,
			vote_date: initiatives.vote_date,
			created_by: initiatives.created_by,
			created_at: initiatives.created_at,
			updated_at: initiatives.updated_at,
			parish_name: parishes.name,
			parish_code: parishes.code,
			cover_image: initiatives.cover_image,
		})
			.from(initiatives)
			.innerJoin(parishes, eq(initiatives.parish_id, parishes.id))
			.where(eq(initiatives.status, 'approved'))
			.orderBy(desc(initiatives.created_at))
			.all();
	},

	getInitiativeById: (id: number) => {
		const result = drizzleDb.select({
			id: initiatives.id,
			title: initiatives.title,
			description: initiatives.description,
			content: initiatives.content,
			parish_id: initiatives.parish_id,
			status: initiatives.status,
			submission_date: initiatives.submission_date,
			vote_date: initiatives.vote_date,
			created_by: initiatives.created_by,
			created_at: initiatives.created_at,
			updated_at: initiatives.updated_at,
			parish_name: parishes.name,
			parish_code: parishes.code,
			cover_image: initiatives.cover_image,
		})
			.from(initiatives)
			.innerJoin(parishes, eq(initiatives.parish_id, parishes.id))
			.where(eq(initiatives.id, id))
			.get();
		return result || null;
	},

	getInitiativesByParish: (parish_id: number) => {
		return drizzleDb.select().from(initiatives)
			.where(eq(initiatives.parish_id, parish_id))
			.orderBy(desc(initiatives.created_at))
			.all();
	},

	createInitiative: (title: string, description: string, content: string, parish_id: number, created_by: number) => {
		const result = drizzleDb.insert(initiatives).values({
			title,
			description,
			content,
			parish_id,
			created_by,
		}).returning({ id: initiatives.id }).get();
		return result.id;
	},

	createInitiativeFull: (initiative: NewInitiative, tagIds?: number[]) => {
		const result = drizzleDb.insert(initiatives).values({
			title: initiative.title,
			description: initiative.description,
			content: initiative.content,
			parish_id: initiative.parish_id,
			created_by: initiative.created_by,
			status: initiative.status as 'draft' | 'submitted' | 'approved' | 'rejected',
			submission_date: initiative.submission_date,
			// Meeting fields
			proposal_number: initiative.proposal_number,
			proposal_type: initiative.proposal_type as 'proposal' | 'amendment' | null,
			meeting_number: initiative.meeting_number,
			meeting_date: initiative.meeting_date,
			meeting_type: initiative.meeting_type as 'public' | 'private' | 'extraordinary' | null,
			meeting_notes: initiative.meeting_notes,
			// Cover image
			cover_image: initiative.cover_image,
		}).returning({ id: initiatives.id }).get();

		if (tagIds && tagIds.length > 0) {
			drizzleDb.insert(initiative_tags).values(
				tagIds.map(tagId => ({
					initiative_id: result.id,
					tag_id: tagId,
				})),
			).run();
		}
		return result.id;
	},

	getFullInitiativeById: (id: number) => {
		const initiative = drizzleDb.select({
			id: initiatives.id,
			title: initiatives.title,
			description: initiatives.description,
			content: initiatives.content,
			parish_id: initiatives.parish_id,
			status: initiatives.status,
			submission_date: initiatives.submission_date,
			vote_date: initiatives.vote_date,
			created_by: initiatives.created_by,
			created_at: initiatives.created_at,
			updated_at: initiatives.updated_at,
			parish_name: parishes.name,
			parish_code: parishes.code,
			// Meeting fields
			proposal_number: initiatives.proposal_number,
			proposal_type: initiatives.proposal_type,
			meeting_number: initiatives.meeting_number,
			meeting_date: initiatives.meeting_date,
			meeting_type: initiatives.meeting_type,
			meeting_notes: initiatives.meeting_notes,
			// Cover image
			cover_image: initiatives.cover_image,
		})
			.from(initiatives)
			.innerJoin(parishes, eq(initiatives.parish_id, parishes.id))
			.where(eq(initiatives.id, id))
			.get();

		if (!initiative) {
			return null;
		}

		// Get related data
		const initiativeTags = drizzleDb.select().from(tags)
			.innerJoin(initiative_tags, eq(tags.id, initiative_tags.tag_id))
			.where(eq(initiative_tags.initiative_id, id))
			.all();

		const initiativeVotes = drizzleDb.select().from(votes)
			.where(eq(votes.initiative_id, id))
			.all();

		const documents = drizzleDb.select().from(initiative_documents)
			.where(eq(initiative_documents.initiative_id, id))
			.all();

		return {
			...initiative,
			tags: initiativeTags.map(row => row.tags),
			votes: initiativeVotes,
			documents,
		};
	},

	// Search functions
	searchInitiatives: (search: string | null, parish_code: string | null, tag_name?: string | null) => {
		const baseQuery = drizzleDb.select({
			id: initiatives.id,
			title: initiatives.title,
			description: initiatives.description,
			content: initiatives.content,
			parish_id: initiatives.parish_id,
			status: initiatives.status,
			submission_date: initiatives.submission_date,
			vote_date: initiatives.vote_date,
			created_by: initiatives.created_by,
			created_at: initiatives.created_at,
			meeting_date: initiatives.meeting_date,
			updated_at: initiatives.updated_at,
			parish_name: parishes.name,
			parish_code: parishes.code,
			cover_image: initiatives.cover_image,
		})
			.from(initiatives)
			.innerJoin(parishes, eq(initiatives.parish_id, parishes.id));

		// Apply filters
		const conditions = [];

		if (search) {
			conditions.push(
				or(
					like(initiatives.title, `%${search}%`),
					like(initiatives.description, `%${search}%`),
					like(initiatives.content, `%${search}%`),
				)!,
			);
		}

		if (parish_code) {
			conditions.push(eq(parishes.code, parish_code));
		}

		if (tag_name) {
			conditions.push(eq(tags.name, tag_name));
			// Join with tags when tag filtering is needed
			return drizzleDb.selectDistinct({
				id: initiatives.id,
				title: initiatives.title,
				description: initiatives.description,
				content: initiatives.content,
				parish_id: initiatives.parish_id,
				status: initiatives.status,
				submission_date: initiatives.submission_date,
				vote_date: initiatives.vote_date,
				created_by: initiatives.created_by,
				created_at: initiatives.created_at,
				updated_at: initiatives.updated_at,
				parish_name: parishes.name,
				meeting_date: initiatives.meeting_date,
				parish_code: parishes.code,
				cover_image: initiatives.cover_image,
			})
				.from(initiatives)
				.innerJoin(parishes, eq(initiatives.parish_id, parishes.id))
				.innerJoin(initiative_tags, eq(initiatives.id, initiative_tags.initiative_id))
				.innerJoin(tags, eq(initiative_tags.tag_id, tags.id))
				.where(and(...conditions))
				.orderBy(desc(initiatives.created_at))
				.all();
		}

		return baseQuery.where(and(...conditions)).orderBy(desc(initiatives.created_at)).all();
	},
	// Tag functions
	getAllTags: (): Tag[] => {
		return drizzleDb.select().from(tags).orderBy(tags.name).all();
	},

	getTagById: (id: number): Tag | null => {
		const result = drizzleDb.select().from(tags).where(eq(tags.id, id)).get();
		return result || null;
	},

	getTagByName: (name: string): Tag | null => {
		const result = drizzleDb.select().from(tags).where(eq(tags.name, name)).get();
		return result || null;
	},

	createTag: (name: string, color: string): number => {
		const result = drizzleDb.insert(tags).values({ name, color }).returning({ id: tags.id }).get();
		return result.id;
	},

	getInitiativeTags: (initiative_id: number): Tag[] => {
		const result = drizzleDb.select().from(tags)
			.innerJoin(initiative_tags, eq(tags.id, initiative_tags.tag_id))
			.where(eq(initiative_tags.initiative_id, initiative_id))
			.all();

		return result.map(row => row.tags);
	},

	addInitiativeTag: (initiative_id: number, tag_id: number): void => {
		drizzleDb.insert(initiative_tags).values({ initiative_id, tag_id }).run();
	},

	removeInitiativeTag: (initiative_id: number, tag_id: number): void => {
		drizzleDb.delete(initiative_tags)
			.where(and(
				eq(initiative_tags.initiative_id, initiative_id),
				eq(initiative_tags.tag_id, tag_id),
			)).run();
	},

	clearInitiativeTags: (initiative_id: number): void => {
		drizzleDb.delete(initiative_tags)
			.where(eq(initiative_tags.initiative_id, initiative_id)).run();
	},

	updateInitiative: (id: number, title: string, description: string, content: string): void => {
		drizzleDb.update(initiatives)
			.set({
				title,
				description,
				content,
				updated_at: (new Date).toISOString(),
			})
			.where(eq(initiatives.id, id)).run();
	},

	updateInitiativeStatus: (id: number, status: 'draft' | 'submitted' | 'approved' | 'rejected'): void => {
		drizzleDb.update(initiatives)
			.set({
				status,
				updated_at: (new Date).toISOString(),
			})
			.where(eq(initiatives.id, id)).run();
	},

	updateInitiativeFull: (id: number, data: {
		title: string,
		description: string,
		content: string,
		status: string,
		submission_date: string | null,
		proposal_number?: string | null,
		proposal_type?: string | null,
		meeting_number?: number | null,
		meeting_date?: string | null,
		meeting_type?: string | null,
		meeting_notes?: string | null,
		cover_image?: string | null,
	}): void => {
		const updateData: Partial<typeof initiatives.$inferInsert> = {
			title: data.title,
			description: data.description,
			content: data.content,
			status: data.status as 'draft' | 'submitted' | 'approved' | 'rejected',
			updated_at: (new Date).toISOString(),
			// Meeting fields
			proposal_number: data.proposal_number,
			proposal_type: data.proposal_type as 'proposal' | 'amendment' | null,
			meeting_number: data.meeting_number,
			meeting_date: data.meeting_date,
			meeting_type: data.meeting_type as 'public' | 'private' | 'extraordinary' | null,
			meeting_notes: data.meeting_notes,
			// Cover image
			cover_image: data.cover_image,
		};

		if (data.submission_date !== null) {
			updateData.submission_date = data.submission_date;
		}

		drizzleDb.update(initiatives)
			.set(updateData)
			.where(eq(initiatives.id, id)).run();
	},
	// Vote functions
	getInitiativeVotes: (initiative_id: number): Vote[] => {
		return drizzleDb.select().from(votes)
			.where(eq(votes.initiative_id, initiative_id))
			.orderBy(votes.voter_name)
			.all();
	},

	addVote: (initiative_id: number, voter_name: string, vote: 'favor' | 'against' | 'abstention', notes?: string): void => {
		drizzleDb.insert(votes).values({
			initiative_id,
			voter_name,
			vote,
			notes,
		}).run();
	},

	updateVote: (vote_id: number, voter_name: string, vote: 'favor' | 'against' | 'abstention', notes?: string): void => {
		drizzleDb.update(votes)
			.set({
				voter_name,
				vote,
				notes,
			})
			.where(eq(votes.id, vote_id)).run();
	},

	deleteVote: (vote_id: number): void => {
		drizzleDb.delete(votes)
			.where(eq(votes.id, vote_id)).run();
	},

	clearInitiativeVotes: (initiative_id: number): void => {
		drizzleDb.delete(votes)
			.where(eq(votes.initiative_id, initiative_id)).run();
	},
	// Document functions
	getInitiativeDocuments: (initiative_id: number): InitiativeDocument[] => {
		return drizzleDb.select().from(initiative_documents)
			.where(eq(initiative_documents.initiative_id, initiative_id))
			.orderBy(initiative_documents.uploaded_at)
			.all();
	},

	addInitiativeDocument: (initiative_id: number, filename: string, original_filename: string, file_path: string, file_size: number, mime_type: string): void => {
		drizzleDb.insert(initiative_documents).values({
			initiative_id,
			filename,
			original_filename,
			file_path,
			file_size,
			mime_type,
		}).run();
	},

	deleteInitiativeDocument: (id: number): InitiativeDocument | undefined => {
		const document = drizzleDb.select().from(initiative_documents)
			.where(eq(initiative_documents.id, id)).get();

		if (document) {
			drizzleDb.delete(initiative_documents)
				.where(eq(initiative_documents.id, id)).run();

			// Also delete the physical file
			try {
				if (fs.existsSync(document.file_path)) {
					fs.unlinkSync(document.file_path);
				}
			} catch (error) {
				console.error('Error deleting file:', error);
			}

			return document;
		}
		return undefined;
	},

	getInitiativeDocument: (id: number): InitiativeDocument | undefined => {
		const result = drizzleDb.select().from(initiative_documents)
			.where(eq(initiative_documents.id, id)).get();

		return result || undefined;
	},

	deleteAllInitiatives: (): { deleted: number; errors: number } => {
		let deleted = 0;
		let errors = 0;

		try {
			// Get all initiatives
			const allInitiatives = drizzleDb.select().from(initiatives).all();

			// Get all documents to delete physical files
			const allDocuments = drizzleDb.select().from(initiative_documents).all();

			// Delete physical files
			for (const document of allDocuments) {
				try {
					if (fs.existsSync(document.file_path)) {
						fs.unlinkSync(document.file_path);
					}
				} catch (error) {
					console.error('Error deleting file:', error);
					errors++;
				}
			}

			// Delete all related data in correct order
			drizzleDb.delete(votes).run();
			drizzleDb.delete(initiative_tags).run();
			drizzleDb.delete(initiative_documents).run();
			drizzleDb.delete(initiatives).run();

			deleted = allInitiatives.length;

			return { deleted, errors };
		} catch (error) {
			console.error('Error deleting all initiatives:', error);
			return { deleted: 0, errors: 1 };
		}
	},
};