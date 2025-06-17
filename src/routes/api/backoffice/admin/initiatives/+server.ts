import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';

export const GET: RequestHandler = async ({ locals }) => {
  // Check if user is authenticated (no role restriction)
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stmt = db.prepare(`
      SELECT i.*, p.name as parish_name, p.code as parish_code, u.email as created_by_email
      FROM initiatives i 
      JOIN parishes p ON i.parish_id = p.id 
      JOIN users u ON i.created_by = u.id
      ORDER BY i.created_at DESC
    `);

    const initiatives = stmt.all();

    // Get tags for each initiative
    const tagStmt = db.prepare(`
      SELECT t.* FROM tags t 
      JOIN initiative_tags it ON t.id = it.tag_id 
      WHERE it.initiative_id = ?
    `);

    for (const initiative of initiatives as Array<Record<string, unknown>>) {
      const tags = tagStmt.all(initiative.id as number);
      (initiative as Record<string, unknown>).tags = tags;
    }

    return json(initiatives);
  } catch (error) {
    console.error('Error fetching admin initiatives:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};