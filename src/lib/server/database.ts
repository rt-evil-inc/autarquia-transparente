import { Database } from 'bun:sqlite';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { eq, and, like, or, desc } from 'drizzle-orm';
import {
	parishes,
	users,
	tags,
	initiatives,
	initiative_documents,
	initiative_tags,
	votes,
	// Import types from schema
	type User,
	type Parish,
	type Tag,
	type InitiativeDocument,
	type Vote,
} from '../../db/schema.js';

// Initialize database
export const db = new Database('data/portal-autarca.db');
export const drizzleDb = drizzle(db);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Re-export types for backward compatibility
export type { User, Parish, Tag, InitiativeDocument, Vote };
export type { Initiative, InitiativeWithParish, FullInitiative } from '../../db/schema.js';

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
			{ name: 'Parque das Nações', code: 'parque-nacoes', description: 'Freguesia do Parque das Nações' },
			{ name: 'Alvalade', code: 'alvalade', description: 'Freguesia de Alvalade' },
			{ name: 'Santo António', code: 'santo-antonio', description: 'Freguesia de Santo António' },
			{ name: 'Estrela', code: 'estrela', description: 'Freguesia da Estrela' },
			{ name: 'Carnide', code: 'carnide', description: 'Freguesia de Carnide' },
		];

		console.log('Creating parishes...');
		for (const parish of parishData) {
			console.log(`Inserting parish: ${parish.name}`);
			await drizzleDb.insert(parishes).values(parish).onConflictDoNothing();
		}
		console.log('Parishes created successfully');

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

	// Initiative functions
	getAllInitiatives: () => {
		return drizzleDb.select({
			id: initiatives.id,
			title: initiatives.title,
			description: initiatives.description,
			content: initiatives.content,
			parish_id: initiatives.parish_id,
			category: initiatives.category,
			status: initiatives.status,
			submission_date: initiatives.submission_date,
			vote_date: initiatives.vote_date,
			created_by: initiatives.created_by,
			created_at: initiatives.created_at,
			updated_at: initiatives.updated_at,
			parish_name: parishes.name,
			parish_code: parishes.code,
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
			category: initiatives.category,
			status: initiatives.status,
			submission_date: initiatives.submission_date,
			vote_date: initiatives.vote_date,
			created_by: initiatives.created_by,
			created_at: initiatives.created_at,
			updated_at: initiatives.updated_at,
			parish_name: parishes.name,
			parish_code: parishes.code,
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

	createInitiative: (title: string, description: string, content: string, parish_id: number, category: string, created_by: number) => {
		const result = drizzleDb.insert(initiatives).values({
			title,
			description,
			content,
			parish_id,
			category,
			created_by,
		}).returning({ id: initiatives.id }).get();
		return result.id;
	},

	createInitiativeFull: (data: {
		title: string,
		description: string,
		content: string,
		parish_id: number,
		category: string,
		created_by: number,
		status: string,
		submission_date: string | null,
		proposal_number?: string | null,
		proposal_type?: string | null,
		meeting_number?: number | null,
		meeting_date?: string | null,
		meeting_type?: string | null,
		meeting_notes?: string | null,
	}) => {
		const result = drizzleDb.insert(initiatives).values({
			title: data.title,
			description: data.description,
			content: data.content,
			parish_id: data.parish_id,
			category: data.category,
			created_by: data.created_by,
			status: data.status as 'draft' | 'submitted' | 'approved' | 'rejected',
			submission_date: data.submission_date,
			// Meeting fields
			proposal_number: data.proposal_number,
			proposal_type: data.proposal_type as 'proposal' | 'amendment' | null,
			meeting_number: data.meeting_number,
			meeting_date: data.meeting_date,
			meeting_type: data.meeting_type as 'public' | 'private' | 'extraordinary' | null,
			meeting_notes: data.meeting_notes,
		}).returning({ id: initiatives.id }).get();
		return result.id;
	},

	getFullInitiativeById: (id: number) => {
		const initiative = drizzleDb.select({
			id: initiatives.id,
			title: initiatives.title,
			description: initiatives.description,
			content: initiatives.content,
			parish_id: initiatives.parish_id,
			category: initiatives.category,
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
	searchInitiatives: (search: string | null, parish_code: string | null, category: string | null) => {
		const baseQuery = drizzleDb.select({
			id: initiatives.id,
			title: initiatives.title,
			description: initiatives.description,
			content: initiatives.content,
			parish_id: initiatives.parish_id,
			category: initiatives.category,
			status: initiatives.status,
			submission_date: initiatives.submission_date,
			vote_date: initiatives.vote_date,
			created_by: initiatives.created_by,
			created_at: initiatives.created_at,
			updated_at: initiatives.updated_at,
			parish_name: parishes.name,
			parish_code: parishes.code,
		})
			.from(initiatives)
			.innerJoin(parishes, eq(initiatives.parish_id, parishes.id));

		// Apply filters
		const conditions = [eq(initiatives.status, 'approved')];

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

		if (category) {
			conditions.push(eq(initiatives.category, category));
		}

		return baseQuery.where(and(...conditions)).orderBy(desc(initiatives.created_at)).all();
	},

	searchInitiativesWithTag: (search: string | null, tag_name: string, parish_code: string | null, category: string | null) => {
		const conditions = [eq(initiatives.status, 'approved'), eq(tags.name, tag_name)];

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

		if (category) {
			conditions.push(eq(initiatives.category, category));
		}

		return drizzleDb.selectDistinct({
			id: initiatives.id,
			title: initiatives.title,
			description: initiatives.description,
			content: initiatives.content,
			parish_id: initiatives.parish_id,
			category: initiatives.category,
			status: initiatives.status,
			submission_date: initiatives.submission_date,
			vote_date: initiatives.vote_date,
			created_by: initiatives.created_by,
			created_at: initiatives.created_at,
			updated_at: initiatives.updated_at,
			parish_name: parishes.name,
			parish_code: parishes.code,
		})
			.from(initiatives)
			.innerJoin(parishes, eq(initiatives.parish_id, parishes.id))
			.innerJoin(initiative_tags, eq(initiatives.id, initiative_tags.initiative_id))
			.innerJoin(tags, eq(initiative_tags.tag_id, tags.id))
			.where(and(...conditions))
			.orderBy(desc(initiatives.created_at))
			.all();
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

	updateInitiative: (id: number, title: string, description: string, content: string, category: string): void => {
		drizzleDb.update(initiatives)
			.set({
				title,
				description,
				content,
				category,
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
		category: string,
		status: string,
		submission_date: string | null,
		proposal_number?: string | null,
		proposal_type?: string | null,
		meeting_number?: number | null,
		meeting_date?: string | null,
		meeting_type?: string | null,
		meeting_notes?: string | null,
	}): void => {
		const updateData: Partial<typeof initiatives.$inferInsert> = {
			title: data.title,
			description: data.description,
			content: data.content,
			category: data.category,
			status: data.status as 'draft' | 'submitted' | 'approved' | 'rejected',
			updated_at: (new Date).toISOString(),
			// Meeting fields
			proposal_number: data.proposal_number,
			proposal_type: data.proposal_type as 'proposal' | 'amendment' | null,
			meeting_number: data.meeting_number,
			meeting_date: data.meeting_date,
			meeting_type: data.meeting_type as 'public' | 'private' | 'extraordinary' | null,
			meeting_notes: data.meeting_notes,
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
};