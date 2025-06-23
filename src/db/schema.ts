import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const parishes = sqliteTable('parishes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').unique().notNull(),
	code: text('code').unique().notNull(),
	type: text('type', { enum: ['parish', 'autarchy'] }).notNull(),
	description: text('description'),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').unique().notNull(),
	password_hash: text('password_hash').notNull(),
	role: text('role', { enum: ['admin', 'parish'] }).notNull(),
	parish_id: integer('parish_id').references(() => parishes.id),
	is_active: integer('is_active', { mode: 'boolean' }).default(true),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').unique().notNull(),
	/**
	 * Color can be a hex code (e.g., "#ff0000") or a tailwind CSS color name (e.g., "red-500").
	 */
	color: text('color').notNull(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const initiatives = sqliteTable('initiatives', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	description: text('description'),
	content: text('content'),
	parish_id: integer('parish_id').notNull().references(() => parishes.id),
	status: text('status', { enum: ['draft', 'submitted', 'approved', 'rejected'] }).notNull().default('draft'),
	submission_date: text('submission_date'),
	vote_date: text('vote_date'),
	created_by: integer('created_by').notNull().references(() => users.id),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	// Meeting fields
	proposal_number: text('proposal_number'), // Format: "37/2025" or "37-A/2025"
	proposal_type: text('proposal_type', { enum: ['proposal', 'amendment'] }), // "proposal" or "amendment"
	meeting_number: integer('meeting_number'),
	meeting_date: text('meeting_date'),
	meeting_type: text('meeting_type', { enum: ['public', 'private', 'extraordinary'] }), // "public", "private", "extraordinary"
	meeting_notes: text('meeting_notes'),
	proposal_link: text('proposal_link'), // For PDF embedding
});

export const initiative_documents = sqliteTable('initiative_documents', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	initiative_id: integer('initiative_id').notNull().references(() => initiatives.id, { onDelete: 'cascade' }),
	filename: text('filename').notNull(),
	original_filename: text('original_filename').notNull(),
	file_path: text('file_path').notNull(),
	file_size: integer('file_size').notNull(),
	mime_type: text('mime_type').notNull(),
	uploaded_at: text('uploaded_at').default(sql`CURRENT_TIMESTAMP`),
});

export const initiative_tags = sqliteTable('initiative_tags', {
	initiative_id: integer('initiative_id').notNull().references(() => initiatives.id, { onDelete: 'cascade' }),
	tag_id: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, table => ({
	pk: primaryKey({ columns: [table.initiative_id, table.tag_id] }),
}));

export const votes = sqliteTable('votes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	initiative_id: integer('initiative_id').notNull().references(() => initiatives.id, { onDelete: 'cascade' }),
	voter_name: text('voter_name').notNull(),
	vote: text('vote', { enum: ['favor', 'against', 'abstention'] }).notNull(),
	notes: text('notes'),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Export inferred types from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Parish = typeof parishes.$inferSelect;
export type NewParish = typeof parishes.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Initiative = typeof initiatives.$inferSelect;
export type NewInitiative = typeof initiatives.$inferInsert;

export type InitiativeDocument = typeof initiative_documents.$inferSelect;
export type NewInitiativeDocument = typeof initiative_documents.$inferInsert;

export type InitiativeTag = typeof initiative_tags.$inferSelect;
export type NewInitiativeTag = typeof initiative_tags.$inferInsert;

export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;

// Additional derived types
export type InitiativeWithParish = Initiative & {
  parish_name: string | null;
  parish_code: string | null;
};

export type FullInitiative = Initiative & {
  parish_name?: string;
  parish_code?: string;
  tags: Tag[];
  votes: Vote[];
  documents: InitiativeDocument[];
};