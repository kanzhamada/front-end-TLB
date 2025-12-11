import { getFromApi, putToApi, type ApiResponse } from '$lib/api/shared/api';

export type Reservation = {
	id: string;
	invoice: string;
	customer_id: string;
	barber_id: string;
	service_id: string;
	date_time_id: string;
	status: string;
	notes: string;
	voucher_id: string;
	created_at: string;
	updated_at: string;
	// Additional fields for UI convenience (might need mapping from API response)
	customer?: { name: string; phoneNumber: string };
	barber?: { name: string };
	service?: { name: string; price: number };
	dateTime?: { date: string; hour: string };
	reschedule?: { newDate: string; newTime: string } | null;
};

export const getReservations = async (
	fetch: typeof window.fetch,
	token: string
): Promise<ApiResponse<Reservation[]>> => {
	console.log('Fetching reservations from /admin/view-reservations');
	const result = await getFromApi<any[]>(fetch, '/admin/view-reservations', token);
	console.log('Get reservations result:', result);
	if (result.data && result.data.length > 0) {
		console.log('First reservation item:', result.data[0]);
	}

	if (!result.success || !result.data) {
		return {
			success: false,
			message: result.message,
			error: result.error
		};
	}

	const reservations: Reservation[] = result.data.map((item) => ({
		id: item.reservationID,

		invoice: item.invoice,

		customer_id: item.user?.id || '', // Not present in log, but maybe not needed for list
		date_time_id: '', // Not present
		status: item.status,
		notes: '',
		voucher_id: '',
		created_at: item.created_at,
		updated_at: '',
		customer: {
			name: item.user?.name || 'Unknown',
			phoneNumber: item.user?.phone || ''
		},
		barber: {
			name: item.barber?.name || 'Unknown'
		},
		service: {
			name: item.service?.name || 'Unknown',
			price: item.service?.price || 0
		},
		dateTime: {
			date: item.date,
			hour: item.time
		}
	}));

	return {
		success: true,
		message: result.message,
		data: reservations
	};
};

export const getReservationById = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<Reservation>> => {
	console.log(`Fetching reservation detail from /admin/view-reservation/${id}`);
	const result = await getFromApi<any>(fetch, `/admin/view-reservation/${id}`, token);
	console.log('Get reservation detail result:', result);

	if (!result.success || !result.data) {
		return {
			success: false,
			message: result.message,
			error: result.error
		};
	}

	const item = result.data;
	console.log('Raw reservation detail item:', item);

	// Check if item is an array (some APIs return single item in array)
	const dataToMap = Array.isArray(item) ? item[0] : item;
	console.log('Data to map:', dataToMap);

	const reservation: Reservation = {
		id: dataToMap.reservationID || dataToMap.id, // Try both
		invoice: dataToMap.invoice,
		customer_id: dataToMap.user?.id || dataToMap.customer_id || '',
		barber_id: dataToMap.barber?.id || dataToMap.barber_id || '',
		service_id: dataToMap.service?.id || dataToMap.service_id || '',
		date_time_id: dataToMap.date_time_id || '',
		status: dataToMap.status,
		notes: dataToMap.notes || '',
		voucher_id: dataToMap.voucher_id || '',
		created_at: dataToMap.created_at,
		updated_at: dataToMap.updated_at || '',
		customer: {
			name: dataToMap.user?.name || dataToMap.customer?.name || 'Unknown',
			phoneNumber: dataToMap.user?.phone || dataToMap.customer?.phoneNumber || ''
		},
		barber: {
			name: dataToMap.barber?.name || 'Unknown'
		},
		service: {
			name: dataToMap.service?.name || 'Unknown',
			price: dataToMap.service?.price || 0
		},
		dateTime: {
			date: dataToMap.date || dataToMap.dateTime?.date,
			hour: dataToMap.time || dataToMap.dateTime?.hour
		},
		reschedule: dataToMap.reschedule ? {
			newDate: dataToMap.reschedule.newDate,
			newTime: dataToMap.reschedule.newTime
		} : null
	};

	return {
		success: true,
		message: result.message,
		data: reservation
	};
};

export const acceptReservation = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, `/admin/accept-reservation/${id}`, {}, token);
};

export const declineReservation = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, `/admin/decline-reservation/${id}`, {}, token);
};

export const completeReservation = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, `/admin/complete-reservation/${id}`, {}, token);
};

export const cancelReservation = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, `/admin/cancel-reservation/${id}`, {}, token);
};

export const acceptReschedule = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, `/admin/accept-reschedule/${id}`, {}, token);
};

export const declineReschedule = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, `/admin/decline-reschedule/${id}`, {}, token);
};
