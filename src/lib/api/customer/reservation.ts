// src/lib/api/customer/reservation.ts
import type { ApiResponse } from '$lib/api/shared/api';
import type {
	ReservationResponse,
	CreateReservationPayload,
	CreateReservationResponse,
	CancelReservationResponse,
	RescheduleReservationResponse,
	CreateTransactionResponse
} from '$lib/types/reservationTypes';

const API_URL = import.meta.env.PUBLIC_API_URL;

export const createReservation = async (
	payload: CreateReservationPayload,
	accessToken: string
): Promise<ApiResponse<CreateReservationResponse>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/create-reservation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify(payload)
		});

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to create reservation',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to create reservation',
			error
		};
	}
};

// API function to get all reservations
export const getReservations = async (
	accessToken: string
): Promise<ApiResponse<ReservationResponse[]>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/view-reservation`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});

		const json = await response.json();
		console.log(json)
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to fetch reservations',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch reservations',
			error
		};
	}
};

// API function to get reservation details
export const getReservationDetails = async (
	reservationId: string,
	accessToken: string
): Promise<ApiResponse<ReservationResponse[]>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/view-detail-reservation/${reservationId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});

		console.log(response)

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to fetch reservation details',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch reservation details',
			error
		};
	}
};

// API function to cancel reservation
export const cancelReservation = async (
	reservationId: string,
	accessToken: string
): Promise<ApiResponse<CancelReservationResponse>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/cancel-reservation/${reservationId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			}
		});

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to cancel reservation',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to cancel reservation',
			error
		};
	}
};

// API function to reschedule reservation
export const rescheduleReservation = async (
	reservationId: string,
	dateTimeId: string,
	accessToken: string
): Promise<ApiResponse<RescheduleReservationResponse>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/reschedule-reservation/${reservationId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				dateTimeId
			})
		});

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to reschedule reservation',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to reschedule reservation',
			error
		};
	}
};

// API function to create transaction for payment
export const createTransaction = async (
	reservationId: string,
	accessToken: string
): Promise<ApiResponse<CreateTransactionResponse>> => {
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/payments/create-transaction`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({
				reservationId
			})
		});

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to create transaction',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to create transaction',
			error
		};
	}
};

// Re-export types for convenience
export type {
	ReservationResponse,
	CreateReservationPayload,
	CreateReservationResponse,
	CancelReservationResponse,
	RescheduleReservationResponse,
	CreateTransactionResponse
};
