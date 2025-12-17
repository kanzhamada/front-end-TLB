import type { Barber } from '$lib/api/shared/api';
import {
	getBarbers as getBarbersApi,
	postToApi,
	putToApi,
	deleteFromApi,
	type ApiResponse
} from '$lib/api/shared/api';

// Re-export the Barber type for convenience
export type { Barber };

export const getBarbers = async (fetch: typeof window.fetch): Promise<ApiResponse<Barber[]>> => {
	return getBarbersApi(fetch);
};

export const getBarberById = async (
	fetch: typeof window.fetch,
	id: string
): Promise<ApiResponse<Barber>> => {
	// Since there isn't a specific get-barber-by-id endpoint documented,
	// we'll fetch all and find one, or we could assume GET /shared/view-barber/:id exists.
	// Given the pattern, let's try to fetch all and filter for now to be safe,
	// unless we want to infer GET /admin/view-barber/:id
	// Let's stick to fetching all and filtering as a fallback if no specific ID endpoint is confirmed.
	// However, for admin edit pages, we usually need a single fetch.
	// Let's try to infer GET /shared/view-barber/:id or just filter from the list.
	// Filtering from list is safer if the list is small.
	const result = await getBarbersApi(fetch);
	if (!result.success || !result.data) {
		return {
			success: false,
			message: result.message,
			error: result.error
		};
	}
	const barber = result.data.find((b) => b.id === id);
	if (!barber) {
		return {
			success: false,
			message: 'Barber not found'
		};
	}
	return {
		success: true,
		data: barber
	};
};

export const createBarber = async (
	fetch: typeof window.fetch,
	barber: Omit<Barber, 'id'>,
	token: string
): Promise<ApiResponse<Barber>> => {
	return postToApi<Barber>(fetch, '/admin/create-barber', barber, token);
};

export const editBarber = async (
	fetch: typeof window.fetch,
	id: string,
	barber: Partial<Barber>,
	token: string
): Promise<ApiResponse<Barber>> => {
	return putToApi<Barber>(fetch, `/admin/update-barber/${id}`, barber, token);
};

export const deleteBarber = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<void>> => {
	return deleteFromApi<void>(fetch, `/admin/delete-barber/${id}`, token);
};
