import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { queries, type Tag } from '$lib/server/database';
import { randomColor } from '$lib/colors';

// Type definitions
export type TagResponse = Tag;

export type TagsListResponse = TagResponse[];

export const GET: RequestHandler = async () => {
	try {
		const tags = queries.getAllTags();
		return json(tags);
	} catch (error) {
		console.error('Error fetching tags:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { name, color } = await request.json();

		if (!name || !name.trim()) {
			return json({ error: 'Tag name is required' }, { status: 400 });
		}

		const tagName = name.trim();
		const tagColor = color || randomColor().name; // Default blue color

		// Check if tag already exists
		const existing = queries.getTagByName(tagName);

		if (existing) {
			return json({ error: 'Tag already exists', tag: existing }, { status: 409 });
		}

		// Create new tag
		const newTag = queries.createTag(name, tagColor);

		return json({ success: true, tag: newTag });
	} catch (error) {
		console.error('Error creating tag:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};