import type { PageLoad } from './$types';
import type { FullInitiative, Tag } from '$lib/server/database';
import { error, redirect } from '@sveltejs/kit';
import type { User } from '$lib/auth';

export interface ParishInitiativeEditData {
	initiative: FullInitiative;
	tags: Tag[];
	user: User;
	categories: string[];
}

export const load: PageLoad = async ({ params, fetch, parent }) => {
  // Get parent data to check authentication
  const { user } = await parent();

  // Check if user is authenticated and is a parish user
  if (!user || user.role !== 'parish') {
    redirect(302, '/login');
  }

  const { id } = params;

  if (!id || isNaN(Number(id))) {
    error(400, 'Invalid initiative ID');
  }

  // Fetch initiative and tags data in parallel
  const [initiativeResponse, tagsResponse] = await Promise.all([
    fetch(`/api/parish/initiatives/${id}`),
    fetch('/api/tags'),
  ]);

  if (!initiativeResponse.ok) {
    if (initiativeResponse.status === 404) {
      error(404, 'Initiative not found');
    }
    if (initiativeResponse.status === 401) {
      redirect(302, '/login');
    }
    error(initiativeResponse.status, `Failed to load initiative: ${initiativeResponse.statusText}`);
  }

  if (!tagsResponse.ok) {
    error(tagsResponse.status, `Failed to load tags: ${tagsResponse.statusText}`);
  }

  const initiative: FullInitiative = await initiativeResponse.json();
  const tags: Tag[] = await tagsResponse.json();

  // Verify the initiative belongs to the current user's parish
  if (initiative.parish_id !== user.parish_id) {
    error(403, 'You can only edit initiatives from your parish');
  }

  // Verify the initiative was created by the current user
  if (initiative.created_by !== user.id) {
    error(403, 'You can only edit initiatives you created');
  }

  const categories = [
    'Finanças',
    'Transparência',
    'Mobilidade',
    'Segurança',
    'Habitação',
    'Património',
    'Ambiente',
    'Educação',
    'Saúde',
    'Cultura',
  ];

  return {
    initiative,
    tags,
    user,
    categories,
  } satisfies ParishInitiativeEditData;
};