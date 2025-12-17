import {
	getFromApi,
	postToApi,
	putToApi,
	deleteFromApi,
	type ApiResponse
} from '$lib/api/shared/api';

export type OperationalTime = {
	id: string;
	date: string;
	hour: string[];
};

export const getOperationalTimes = async (
	fetch: typeof window.fetch,
	token: string
): Promise<ApiResponse<OperationalTime[]>> => {
	// Using shared endpoint
	// Note: The shared endpoint returns OperationalDay[], which has a slightly different structure.
	// We might need to map it if we want to stick to OperationalTime type, or update the type.
	// Let's check the shared API response structure again.
	// Shared API returns: { id: string, date: string, hours: { id, rawTime, time, status }[] }
	// The admin UI likely expects a list of hours.
	// Let's fetch from shared and map it to OperationalTime.

	const result = await getFromApi<any[]>(fetch, '/shared/view-operational', token);

	if (!result.success || !result.data) {
		return {
			success: false,
			message: result.message,
			error: result.error
		};
	}

	const mappedData: OperationalTime[] = result.data.map((item: any) => ({
		id: item.dateID,
		date: item.date,
		hour: item.hourDetail.map((h: any) => h.hour)
	}));

	return {
		success: true,
		data: mappedData
	};
};

export const getOperationalTimeById = async (
	fetch: typeof window.fetch,
	id: string
): Promise<ApiResponse<OperationalTime>> => {
	const result = await getOperationalTimes(fetch);
	if (!result.success || !result.data) {
		return {
			success: false,
			message: result.message,
			error: result.error
		};
	}
	const opTime = result.data.find((o) => o.id === id);
	if (!opTime) {
		return {
			success: false,
			message: 'OperationalTime not found'
		};
	}
	return {
		success: true,
		data: opTime
	};
};

export const createOperationalTime = async (
	fetch: typeof window.fetch,
	data: Omit<OperationalTime, 'id'>,
	token: string
): Promise<ApiResponse<OperationalTime>> => {
	// Inferred endpoint
	return postToApi<OperationalTime>(fetch, '/admin/create-operational', data, token);
};

export const editOperationalTime = async (
	fetch: typeof window.fetch,
	id: string,
	data: Partial<OperationalTime>,
	token: string
): Promise<ApiResponse<OperationalTime>> => {
	// Inferred endpoint
	return putToApi<OperationalTime>(fetch, `/admin/update-operational/${id}`, data, token);
};

export const deleteOperationalTime = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<void>> => {
	// Inferred endpoint
	return deleteFromApi<void>(fetch, `/admin/delete-operational/${id}`, token);
};

// --- Weekly Schedule ---

export type WeeklySchedule = {
	sunday: string[];
	monday: string[];
	tuesday: string[];
	wednesday: string[];
	thursday: string[];
	friday: string[];
	saturday: string[];
};

export const getSchedule = async (
	fetch: typeof window.fetch,
	token: string
): Promise<ApiResponse<WeeklySchedule>> => {
	// Updated endpoint based on user feedback
	return getFromApi<WeeklySchedule>(fetch, '/shared/view-schedule', token);
};

export const updateSchedule = async (
	fetch: typeof window.fetch,
	data: WeeklySchedule,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, '/admin/update-schedule', data, token);
};
