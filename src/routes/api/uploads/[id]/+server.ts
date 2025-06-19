// Make sure uploads directory exists
import { mkdirSync } from 'fs';
import { uploadsDir } from '$lib/config/index.js';
try {
	mkdirSync(uploadsDir, { recursive: true });
} catch (error) {
	console.error('Error creating uploads directory:', error);
}

export const GET = async ({ params: { id } }) => {
	console.log('Fetching file with ID:', id);
	const filePath = `${uploadsDir}/${id}`;
	const file = Bun.file(filePath);
	return new Response(file);
};