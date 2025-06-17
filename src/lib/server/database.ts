import { Database } from 'bun:sqlite';
import bcrypt from 'bcrypt';
import fs from 'fs';

// Initialize database with strict mode
export const db = new Database('portal-autarca.db');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

export type User = {
  id: number;
  email: string;
  password_hash: string; // Optional for non-authenticated users
  role: 'admin' | 'parish';
  parish_id?: number; // Optional for admin users
  is_active: boolean;
  created_at?: Date; // Optional for non-authenticated users
  updated_at?: Date; // Optional for non-authenticated users
}

export type Parish = {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at?: Date; // Optional for non-authenticated users
}
export type Tag = {
  id: number;
  name: string;
  color: string;
  created_at?: Date; //
}

export type Initiative = {
  id: number;
  title: string;
  description?: string;
  content?: string;
  parish_id: number;
  category?: string; // Optional for non-authenticated users
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submission_date?: Date;
  vote_date?: Date;
  created_by: number; // User ID of the creator
  created_at: Date;
  updated_at: Date;
}

export type InitiativeWithParish = Initiative & {
  parish_name: string; // Name of the parish
  parish_code: string; // Code of the parish
}

export type InitiativeDocument = {
  id: number;
  initiative_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at?: Date; // Optional for non-authenticated users
}
export type InitiativeTag = {
  initiative_id: number;
  tag_id: number;
}

export type Vote = {
  id: number;
  initiative_id: number;
  voter_name: string; // Name of the voter
  vote: 'favor' | 'against' | 'abstention'; // Type of vote
  notes?: string; // Optional notes from the voter
  created_at?: Date; // Optional for non-authenticated users
}

// Create tables
export function initializeDatabase() {
	// Users table
	console.log('Creating users table...');
	db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'parish')),
      parish_id INTEGER,
      is_active BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parish_id) REFERENCES parishes(id)
    )
  `);

	// Parishes table
	console.log('Creating parishes table...');
	db.exec(`
    CREATE TABLE IF NOT EXISTS parishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

	// Tags table
	console.log('Creating tags table...');
	db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

	// Initiatives table
	console.log('Creating initiatives table...');
	db.exec(`
    CREATE TABLE IF NOT EXISTS initiatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      parish_id INTEGER NOT NULL,
      category TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
      submission_date DATETIME,
      vote_date DATETIME,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parish_id) REFERENCES parishes(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

	// Initiative documents table
	console.log('Creating initiative_documents table...');
	db.exec(`
    CREATE TABLE IF NOT EXISTS initiative_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      initiative_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE
    )
  `);

	// Initiative tags junction table
	console.log('Creating initiative_tags junction table...');
	db.exec(`
    CREATE TABLE IF NOT EXISTS initiative_tags (
      initiative_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (initiative_id, tag_id),
      FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

	// Votes table
	console.log('Creating votes table...');
	db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      initiative_id INTEGER NOT NULL,
      voter_name TEXT NOT NULL,
      vote TEXT NOT NULL CHECK (vote IN ('favor', 'against', 'abstention')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE
    )
  `);

	console.log('Database tables created successfully');
}

// Seed initial data
export async function seedDatabase() {
	try {
		console.log('Starting database seeding...');

		// Create default parishes
		const parishes = [
			{ name: 'Parque das Nações', code: 'parque-nacoes', description: 'Freguesia do Parque das Nações' },
			{ name: 'Alvalade', code: 'alvalade', description: 'Freguesia de Alvalade' },
			{ name: 'Santo António', code: 'santo-antonio', description: 'Freguesia de Santo António' },
			{ name: 'Estrela', code: 'estrela', description: 'Freguesia da Estrela' },
			{ name: 'Carnide', code: 'carnide', description: 'Freguesia de Carnide' },
		];

		console.log('Creating parishes...');
		const insertParish = db.prepare('INSERT OR IGNORE INTO parishes (name, code, description) VALUES ($name, $code, $description)');

		for (const parish of parishes) {
			console.log(`Inserting parish: ${parish.name}`);
			insertParish.all({
				$name: parish.name,
				$code: parish.code,
				$description: parish.description,
			});
		}
		console.log('Parishes created successfully');

		// Create default tags
		const tags = [
			{ name: 'Finanças', color: '#10B981' },
			{ name: 'Transparência', color: '#3B82F6' },
			{ name: 'Mobilidade', color: '#F59E0B' },
			{ name: 'Segurança', color: '#EF4444' },
			{ name: 'Habitação', color: '#8B5CF6' },
			{ name: 'Património', color: '#6B7280' },
			{ name: 'Setor Empresarial do Estado', color: '#84CC16' },
		];

		console.log('Creating tags...');
		const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name, color) VALUES ($name, $color)');

		for (const tag of tags) {
			console.log(`Inserting tag: ${tag.name}`);
			insertTag.run({
				$name: tag.name,
				$color: tag.color,
			});
		}
		console.log('Tags created successfully');

		// Create admin user
		console.log('Creating admin user...');
		const adminPassword = await bcrypt.hash('admin123', 10);
		console.log('Admin password hashed');
		const insertAdmin = db.prepare('INSERT OR IGNORE INTO users (email, password_hash, role) VALUES ($email, $password_hash, $role)');
		insertAdmin.run({
			$email: 'admin@portal.pt',
			$password_hash: adminPassword,
			$role: 'admin',
		});
		console.log('Admin user created successfully');

		// Create a sample parish user
		console.log('Creating parish user...');
		const parishPassword = await bcrypt.hash('parish123', 10);
		console.log('Parish password hashed');
		const insertParishUser = db.prepare('INSERT OR IGNORE INTO users (email, password_hash, role, parish_id) VALUES ($email, $password_hash, $role, $parish_id)');
		insertParishUser.run({
			$email: 'parque@portal.pt',
			$password_hash: parishPassword,
			$role: 'parish',
			$parish_id: 1,
		});
		console.log('Parish user created successfully');

		console.log('Database seeded successfully');
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}

// Database query helpers - prepared statements
const getUserByEmailQuery = db.prepare<User, { $email: string }>('SELECT * FROM users WHERE email = $email');
const getUserByIdQuery = db.prepare<User, { $id: number }>('SELECT * FROM users WHERE id = $id');
const createUserQuery = db.prepare<null, { $email: string, $password_hash: string, $role: 'admin' | 'parish', $parish_id?: number }>('INSERT INTO users (email, password_hash, role, parish_id) VALUES ($email, $password_hash, $role, $parish_id)');

// Parish queries
const getAllParishesQuery = db.prepare<Parish, []>('SELECT * FROM parishes ORDER BY name');
const getParishByIdQuery = db.prepare<Parish, { $id: number }>('SELECT * FROM parishes WHERE id = $id');
const getParishByCodeQuery = db.prepare<Parish, { $code: string }>('SELECT * FROM parishes WHERE code = $code');

// Initiative queries
const getAllInitiativesQuery = db.prepare<Initiative & { parish_name: string | null, parish_code: string | null }, []>(`
  SELECT i.*, p.name as parish_name, p.code as parish_code 
  FROM initiatives i 
  JOIN parishes p ON i.parish_id = p.id 
  WHERE i.status = 'approved'
  ORDER BY i.created_at DESC
`);
const getInitiativeByIdQuery = db.prepare<Initiative & { parish_name: string | null, parish_code: string | null }, { $id: number }>(`
  SELECT i.*, p.name as parish_name, p.code as parish_code 
  FROM initiatives i 
  JOIN parishes p ON i.parish_id = p.id 
  WHERE i.id = $id
`);
const getInitiativesByParishQuery = db.prepare<Initiative, { $parish_id: number }>(`
  SELECT * FROM initiatives 
  WHERE parish_id = $parish_id 
  ORDER BY created_at DESC
`);
const createInitiativeQuery = db.prepare<{ lastInsertRowid: number }, { $title: string, $description: string, $content: string, $parish_id: number, $category: string, $created_by: number }>(`
  INSERT INTO initiatives (title, description, content, parish_id, category, created_by) 
  VALUES ($title, $description, $content, $parish_id, $category, $created_by)
`);
const createInitiativeFullQuery = db.prepare<{ lastInsertRowid: number }, { $title: string, $description: string, $content: string, $parish_id: number, $category: string, $created_by: number, $status: string, $submission_date: string | null }>(`
  INSERT INTO initiatives (title, description, content, parish_id, category, created_by, status, submission_date) 
  VALUES ($title, $description, $content, $parish_id, $category, $created_by, $status, $submission_date)
`);

// Filtered initiative search
const searchInitiativesQuery = db.prepare<Initiative & { parish_name: string | null, parish_code: string | null }, { $search: string | null, $parish_code: string | null, $category: string | null }>(`
  SELECT i.*, p.name as parish_name, p.code as parish_code 
  FROM initiatives i 
  JOIN parishes p ON i.parish_id = p.id 
  WHERE i.status = 'approved'
    AND ($search IS NULL OR i.title LIKE $search OR i.description LIKE $search OR i.content LIKE $search)
    AND ($parish_code IS NULL OR p.code = $parish_code)
    AND ($category IS NULL OR i.category = $category)
  ORDER BY i.created_at DESC
`);

// Tag-filtered initiatives
const searchInitiativesWithTagQuery = db.prepare<Initiative & { parish_name: string | null, parish_code: string | null }, { $search: string | null, $tag_name: string, $parish_code: string | null, $category: string | null }>(`
  SELECT DISTINCT i.*, p.name as parish_name, p.code as parish_code 
  FROM initiatives i 
  JOIN parishes p ON i.parish_id = p.id 
  JOIN initiative_tags it ON i.id = it.initiative_id
  JOIN tags t ON it.tag_id = t.id
  WHERE i.status = 'approved'
    AND ($search IS NULL OR i.title LIKE $search OR i.description LIKE $search OR i.content LIKE $search)
    AND ($parish_code IS NULL OR p.code = $parish_code)
    AND ($category IS NULL OR i.category = $category)
    AND t.name = $tag_name
  ORDER BY i.created_at DESC
`);

// Tag queries
const getAllTagsQuery = db.prepare<Tag, []>('SELECT * FROM tags ORDER BY name');
const getTagByIdQuery = db.prepare<Tag, { $id: number }>('SELECT * FROM tags WHERE id = $id');
const getTagByNameQuery = db.prepare<Tag, { $name: string }>('SELECT * FROM tags WHERE name = $name');
const createTagQuery = db.prepare<{ lastInsertRowid: number }, { $name: string, $color: string }>('INSERT INTO tags (name, color) VALUES ($name, $color)');
const getInitiativeTagsQuery = db.prepare<Tag, { $initiative_id: number }>(`
  SELECT t.* FROM tags t 
  JOIN initiative_tags it ON t.id = it.tag_id 
  WHERE it.initiative_id = $initiative_id
`);
const addInitiativeTagQuery = db.prepare<null, { $initiative_id: number, $tag_id: number }>('INSERT INTO initiative_tags (initiative_id, tag_id) VALUES ($initiative_id, $tag_id)');
const removeInitiativeTagQuery = db.prepare<null, { $initiative_id: number, $tag_id: number }>('DELETE FROM initiative_tags WHERE initiative_id = $initiative_id AND tag_id = $tag_id');
const clearInitiativeTagsQuery = db.prepare<null, { $initiative_id: number }>('DELETE FROM initiative_tags WHERE initiative_id = $initiative_id');
const updateInitiativeQuery = db.prepare<null, { $id: number, $title: string, $description: string, $content: string, $category: string }>(`
  UPDATE initiatives 
  SET title = $title, description = $description, content = $content, category = $category, updated_at = CURRENT_TIMESTAMP 
  WHERE id = $id
`);
const updateInitiativeStatusQuery = db.prepare<null, { $id: number, $status: string }>(`
  UPDATE initiatives 
  SET status = $status, updated_at = CURRENT_TIMESTAMP 
  WHERE id = $id
`);
const updateInitiativeFullQuery = db.prepare<null, { $id: number, $title: string, $description: string, $content: string, $category: string, $status: string, $submission_date: string | null }>(`
  UPDATE initiatives 
  SET title = $title, description = $description, content = $content, category = $category, status = $status, submission_date = COALESCE($submission_date, submission_date), updated_at = CURRENT_TIMESTAMP 
  WHERE id = $id
`);

// Vote queries
const getInitiativeVotesQuery = db.prepare<Vote, { $initiative_id: number }>('SELECT * FROM votes WHERE initiative_id = $initiative_id ORDER BY voter_name');

// Document queries
const getInitiativeDocumentsQuery = db.prepare<InitiativeDocument, { $initiative_id: number }>('SELECT * FROM initiative_documents WHERE initiative_id = $initiative_id ORDER BY uploaded_at');

const addInitiativeDocumentQuery = db.prepare<void, {
  $initiative_id: number;
  $filename: string;
  $original_filename: string;
  $file_path: string;
  $file_size: number;
  $mime_type: string
}>('INSERT INTO initiative_documents (initiative_id, filename, original_filename, file_path, file_size, mime_type) VALUES ($initiative_id, $filename, $original_filename, $file_path, $file_size, $mime_type) ');
const deleteInitiativeDocumentQuery = db.prepare<void, { $id: number }>('DELETE FROM initiative_documents WHERE id = $id');
const getInitiativeDocumentQuery = db.prepare<InitiativeDocument, { $id: number }>('SELECT * FROM initiative_documents WHERE id = $id');

// Query functions
export const queries = {
	// User functions
	getUserByEmail: (email: string): User | null => {
		return getUserByEmailQuery.get({ $email: email });
	},

	getUserById: (id: number): User | null => {
		return getUserByIdQuery.get({ $id: id });
	},

	createUser: (email: string, password_hash: string, role: 'admin' | 'parish', parish_id?: number): void => {
		createUserQuery.run({ $email: email, $password_hash: password_hash, $role: role, $parish_id: parish_id });
	},

	// Parish functions
	getAllParishes: (): Parish[] => {
		return getAllParishesQuery.all();
	},

	getParishById: (id: number): Parish | null => {
		return getParishByIdQuery.get({ $id: id });
	},

	getParishByCode: (code: string): Parish | null => {
		return getParishByCodeQuery.get({ $code: code });
	},

	// Initiative functions
	getAllInitiatives: () => {
		return getAllInitiativesQuery.all();
	},

	getInitiativeById: (id: number) => {
		return getInitiativeByIdQuery.get({ $id: id });
	},

	getInitiativesByParish: (parish_id: number) => {
		return getInitiativesByParishQuery.all({ $parish_id: parish_id });
	},

	createInitiative: (title: string, description: string, content: string, parish_id: number, category: string, created_by: number) => {
		const result = createInitiativeQuery.run({ $title: title, $description: description, $content: content, $parish_id: parish_id, $category: category, $created_by: created_by });
		return result.lastInsertRowid as number;
	},

	createInitiativeFull: (title: string, description: string, content: string, parish_id: number, category: string, created_by: number, status: string, submission_date: string | null) => {
		const result = createInitiativeFullQuery.run({ $title: title, $description: description, $content: content, $parish_id: parish_id, $category: category, $created_by: created_by, $status: status, $submission_date: submission_date });
		return result.lastInsertRowid as number;
	},

	getFullInitiativeById: (id: number) => {
		const initiative = getInitiativeByIdQuery.get({ $id: id });

		if (!initiative) {
			return null;
		}

		// Get related data
		const tags = getInitiativeTagsQuery.all({ $initiative_id: id });
		const votes = getInitiativeVotesQuery.all({ $initiative_id: id });
		const documents = getInitiativeDocumentsQuery.all({ $initiative_id: id });

		return {
			...initiative,
			tags,
			votes,
			documents,
		};
	},

	// Search functions
	searchInitiatives: (search: string | null, parish_code: string | null, category: string | null) => {
		return searchInitiativesQuery.all({ $search: search, $parish_code: parish_code, $category: category });
	},

	searchInitiativesWithTag: (search: string | null, tag_name: string, parish_code: string | null, category: string | null) => {
		return searchInitiativesWithTagQuery.all({ $search: search, $tag_name: tag_name, $parish_code: parish_code, $category: category });
	},

	// Tag functions
	getAllTags: (): Tag[] => {
		return getAllTagsQuery.all();
	},

	getTagById: (id: number): Tag | null => {
		return getTagByIdQuery.get({ $id: id });
	},

	getTagByName: (name: string): Tag | null => {
		return getTagByNameQuery.get({ $name: name });
	},

	createTag: (name: string, color: string): number => {
		const result = createTagQuery.run({ $name: name, $color: color });
		return result.lastInsertRowid as number;
	},

	getInitiativeTags: (initiative_id: number): Tag[] => {
		return getInitiativeTagsQuery.all({ $initiative_id: initiative_id });
	},

	addInitiativeTag: (initiative_id: number, tag_id: number): void => {
		addInitiativeTagQuery.run({ $initiative_id: initiative_id, $tag_id: tag_id });
	},

	removeInitiativeTag: (initiative_id: number, tag_id: number): void => {
		removeInitiativeTagQuery.run({ $initiative_id: initiative_id, $tag_id: tag_id });
	},

	clearInitiativeTags: (initiative_id: number): void => {
		clearInitiativeTagsQuery.run({ $initiative_id: initiative_id });
	},

	updateInitiative: (id: number, title: string, description: string, content: string, category: string): void => {
		updateInitiativeQuery.run({ $id: id, $title: title, $description: description, $content: content, $category: category });
	},

	updateInitiativeStatus: (id: number, status: 'draft' | 'submitted' | 'approved' | 'rejected'): void => {
		updateInitiativeStatusQuery.run({ $id: id, $status: status });
	},

	updateInitiativeFull: (id: number, title: string, description: string, content: string, category: string, status: string, submission_date: string | null): void => {
		updateInitiativeFullQuery.run({ $id: id, $title: title, $description: description, $content: content, $category: category, $status: status, $submission_date: submission_date });
	},

	// Vote functions
	getInitiativeVotes: (initiative_id: number): Vote[] => {
		return getInitiativeVotesQuery.all({ $initiative_id: initiative_id });
	},

	// Document functions
	getInitiativeDocuments: (initiative_id: number): InitiativeDocument[] => {
		return getInitiativeDocumentsQuery.all({ $initiative_id: initiative_id });
	},

	addInitiativeDocument: (initiative_id: number, filename: string, original_filename: string, file_path: string, file_size: number, mime_type: string): void => {
		addInitiativeDocumentQuery.run({ $initiative_id: initiative_id, $filename: filename, $original_filename: original_filename, $file_path: file_path, $file_size: file_size, $mime_type: mime_type });
	},

	deleteInitiativeDocument: (id: number): InitiativeDocument | undefined => {
		const document = getInitiativeDocumentQuery.get({ $id: id }) ?? undefined;
		if (document) {
			deleteInitiativeDocumentQuery.run({ $id: id });
			// Also delete the physical file
			try {
				if (fs.existsSync(document.file_path)) {
					fs.unlinkSync(document.file_path);
				}
			} catch (error) {
				console.error('Error deleting file:', error);
			}
		}
		return document;
	},

	getInitiativeDocument: (id: number): InitiativeDocument | undefined => {
		return getInitiativeDocumentQuery.get({ $id: id }) ?? undefined;
	},
};

export type FullInitiative = Initiative & {
  parish_name?: string;
  parish_code?: string;
  tags: Tag[];
  votes: Vote[];
  documents: InitiativeDocument[];
}