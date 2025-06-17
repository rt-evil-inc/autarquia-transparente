import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { queries, type Initiative, type InitiativeDocument, type Tag, type Vote } from '$lib/server/database';
export type FullInitiativeResponse = Initiative & {
  tags: Tag[];
  votes: Vote[];
  documents: InitiativeDocument[];
}

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
    error(400, 'Invalid initiative ID');
  }

  const fullInitiative = queries.getFullInitiativeById(Number(id));

  if (!fullInitiative || fullInitiative.status === 'draft') {
    error(404, 'Initiative not found');
  }

  return json(fullInitiative);
};