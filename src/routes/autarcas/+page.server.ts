import autarcasData from '$lib/data/autarcas.json';

export const load = async () => {
	return {
		autarcas: autarcasData,
	};
};