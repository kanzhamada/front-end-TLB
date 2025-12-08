// src/lib/api/customer/profile.ts
import type { ApiResponse } from '$lib/api/shared/api';

export type ProfileData = {
	coin: number;
	email: string;
	phone: string;
	displayName: string;
	photoProfile: string | null;
};

export type UpdateProfilePayload = {
	displayName?: string;
	phone?: string;
	email?: string;
	photoProfile?: string;
};

export type UpdateProfileResponse = {
	displayName: string;
};

export type Voucher = {
	price: number;
	title: string;
	value: number;
	serviceID: string;
	serviceName?: string;
	startDate: string;
	voucherID: string;
	created_at?: string;
	expireDate: string;
	updated_at?: string;
	description: string;
	status?: string;
	buy_date?: string;
};

export type CoinHistoryItem = {
	name: string;
	price: number;
	title: string;
	created_at: string;
};

// API function to get user profile
export const getProfile = async (accessToken: string): Promise<ApiResponse<ProfileData>> => {
	const API_URL = import.meta.env.PUBLIC_API_URL;
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/view-profile`, {
			method: 'GET',
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
				message: json.message ?? 'Failed to fetch profile',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data as ProfileData
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch profile',
			error
		};
	}
};

// API function to update user profile
export const updateProfile = async (
	payload: UpdateProfilePayload,
	accessToken: string
): Promise<ApiResponse<UpdateProfileResponse>> => {
	const API_URL = import.meta.env.PUBLIC_API_URL;
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/update-profile`, {
			method: 'PUT',
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
				message: json.message ?? 'Failed to update profile',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data as UpdateProfileResponse
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to update profile',
			error
		};
	}
};

// API function to get available vouchers
export const getAvailableVouchers = async (
	accessToken: string
): Promise<ApiResponse<Voucher[]>> => {
	const API_URL = import.meta.env.PUBLIC_API_URL;
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/view-available-voucher`, {
			method: 'GET',
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
				message: json.message ?? 'Failed to fetch available vouchers',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data as Voucher[]
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch available vouchers',
			error
		};
	}
};

// API function to get owned vouchers
export const getOwnedVouchers = async (accessToken: string): Promise<ApiResponse<Voucher[]>> => {
	const API_URL = import.meta.env.PUBLIC_API_URL;
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/view-owned-voucher`, {
			method: 'GET',
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
				message: json.message ?? 'Failed to fetch owned vouchers',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data as Voucher[]
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch owned vouchers',
			error
		};
	}
};

// API function to get coin history
export const getCoinHistory = async (
	accessToken: string
): Promise<ApiResponse<CoinHistoryItem[]>> => {
	const API_URL = import.meta.env.PUBLIC_API_URL;
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		const response = await fetch(`${API_URL}/customer/view-coin-history`, {
			method: 'GET',
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
				message: json.message ?? 'Failed to fetch coin history',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data as CoinHistoryItem[]
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to fetch coin history',
			error
		};
	}
};

// API function to buy a voucher
export const buyVoucher = async (
	voucherID: string,
	accessToken: string
): Promise<ApiResponse<null>> => {
	const API_URL = import.meta.env.PUBLIC_API_URL;
	if (!API_URL) {
		return {
			success: false,
			message: 'PUBLIC_API_URL is not configured'
		};
	}

	try {
		console.log(JSON.stringify({ voucherID }))
		const response = await fetch(`${API_URL}/customer/buy-voucher`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify({ voucherID })
		});

		const json = await response.json();
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!response.ok || !successFlag) {
			return {
				success: false,
				message: json.message ?? 'Failed to buy voucher',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: null
		};
	} catch (error) {
		return {
			success: false,
			message: 'Failed to buy voucher',
			error
		};
	}
};
