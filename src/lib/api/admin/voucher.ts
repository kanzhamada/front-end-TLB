import { getFromApi, postToApi, putToApi, deleteFromApi, type ApiResponse } from '$lib/api/shared/api';

export type Voucher = {
	voucherID: string;
	title: string;
	value: number;
	type: 'voucher' | 'redeem_code';
	startDate: string;
	expireDate: string;
	description: string;
	code?: string; // Only for redeem_code
};

export type CreateVoucherRequest = {
	type: 'voucher' | 'redeem_code';
	title: string;
	value: number;
	startDate: string;
	expireDate: string;
	description: string;
	price?: number;
	code?: string;
};

export type UpdateVoucherRequest = {
	type: 'voucher' | 'redeem_code';
	title: string;
	value: number;
	startDate: string;
	expireDate: string;
	description: string;
	code?: string;
};

export const getVouchers = async (
	fetch: typeof window.fetch,
	token: string
): Promise<ApiResponse<Voucher[]>> => {
	return getFromApi<Voucher[]>(fetch, '/admin/view-voucher', token);
};

export const getVoucherById = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<Voucher>> => {
	return getFromApi<Voucher>(fetch, `/shared/view-voucher/${id}`, token);
};

export const createVoucher = async (
	fetch: typeof window.fetch,
	data: CreateVoucherRequest,
	token: string
): Promise<ApiResponse<Voucher>> => {
	return postToApi<Voucher>(fetch, '/admin/create-voucher', data, token);
};

export const updateVoucher = async (
	fetch: typeof window.fetch,
	id: string,
	data: UpdateVoucherRequest,
	token: string
): Promise<ApiResponse<Voucher>> => {
	return putToApi<Voucher>(fetch, `/admin/update-voucher/${id}`, data, token);
};

export const deleteVoucher = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<{ success: boolean; message: string }>> => {
	return deleteFromApi<{ success: boolean; message: string }>(fetch, `/admin/delete-voucher/${id}`, token);
};
