import {
	postToApi,
	putToApi,
	deleteFromApi,
	type ApiResponse,
	type Service,
	getServices
} from '$lib/api/shared/api';

export { type Service, getServices };

export const getServiceById = async (
	fetch: typeof window.fetch,
	id: string
): Promise<ApiResponse<Service>> => {
	const result = await getServices(fetch);
	if (!result.success || !result.data) {
		return {
			success: false,
			message: result.message,
			error: result.error
		};
	}
	const service = result.data.find((s) => s.id === id);
	if (!service) {
		return {
			success: false,
			message: 'Service not found'
		};
	}
	return {
		success: true,
		data: service
	};
};

export const createService = async (
	fetch: typeof window.fetch,
	service: Omit<Service, 'id'>,
	token: string
): Promise<ApiResponse<Service>> => {
	return postToApi<Service>(fetch, '/admin/create-service', service, token);
};

export const editService = async (
	fetch: typeof window.fetch,
	id: string,
	service: Partial<Service>,
	token: string
): Promise<ApiResponse<Service>> => {
	return putToApi<Service>(fetch, `/admin/update-service/${id}`, service, token);
};

export const deleteService = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<void>> => {
	return deleteFromApi<void>(fetch, `/admin/delete-service/${id}`, token);
};
