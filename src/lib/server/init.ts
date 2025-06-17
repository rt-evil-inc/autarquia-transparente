// Initialize database on server start
import { initializeDatabase, seedDatabase } from '$lib/server/database';

// Initialize database tables and seed data
initializeDatabase();
await seedDatabase();

console.log('Portal Autarca database initialized');