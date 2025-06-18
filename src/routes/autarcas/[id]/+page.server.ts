import autarcasData from '$lib/data/autarcas.json';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const autarca = autarcasData.find(a => a.id === params.id);

	if (!autarca) {
		throw error(404, 'Autarca não encontrado');
	}

	return {
		autarca,
	};
};