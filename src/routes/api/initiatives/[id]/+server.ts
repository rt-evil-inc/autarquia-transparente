import { queries } from '$lib/server/database';
import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
export type FullInitiativeResponse = Exclude<ReturnType<typeof queries.getFullInitiativeById>, null>;

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	if (!id || isNaN(Number(id))) {
		error(400, 'Invalid initiative ID');
	}

	const fullInitiative = queries.getFullInitiativeById(Number(id));

	if (!fullInitiative || fullInitiative.status === 'draft') {
		error(404, 'Initiative not found');
	}

	fullInitiative satisfies FullInitiativeResponse;
	return json(fullInitiative);
};