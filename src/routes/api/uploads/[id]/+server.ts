// Make sure uploads directory exists
import { mkdirSync } from 'fs';
import { uploadsDir } from '$lib/config/index.js';
import { error } from '@sveltejs/kit';
try {
	mkdirSync(uploadsDir, { recursive: true });
} catch (error) {
	console.error('Error creating uploads directory:', error);
}

export const GET = async ({ params: { id } }) => {
	const filePath = `${uploadsDir}/${id}`;
	const file = Bun.file(filePath);
	if (!await file.exists()) {
		error(404, 'File not found');
	}
	return new Response(file);
};