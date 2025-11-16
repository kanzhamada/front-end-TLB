import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const reservationId = url.searchParams.get('id');
	
	if (!reservationId) {
		throw new Error('Reservation ID is required');
	}

	return {
		reservationId
	};
};