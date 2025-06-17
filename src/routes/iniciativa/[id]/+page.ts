import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	const response = await fetch(`/api/initiatives/${params.id}`);

	if (response.ok) {
		const initiative = await response.json();
		return {
			initiative,
		};
	} else if (response.status === 404) {
		error(404, 'Iniciativa não encontrada');
	} else {
		error(500, 'Erro ao carregar iniciativa');
	}
};