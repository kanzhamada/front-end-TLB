import {
	getFromApi,
	postToApi,
	putToApi,
	deleteFromApi,
	type ApiResponse
} from '$lib/api/shared/api';

export type OfflineIncome = {
	id: string;
	date: string;
	type: string;
	price: number;
	service: {
		id: string;
		name: string;
	};
};

export type Expense = {
	id: string;
	date: string;
	description: string;
	nominal: number;
};

export type CashFlowStats = {
	daily: {
		offline_income: number;
		online_income: number;
		expenses: number;
		cash_flow: number;
	};
	weekly: {
		offline_income: number;
		online_income: number;
		expenses: number;
		cash_flow: number;
	};
	monthly: {
		offline_income: number;
		online_income: number;
		expenses: number;
		cash_flow: number;
	};
};

// Offline Income
export const getOfflineIncome = async (
	fetch: typeof window.fetch,
	token: string
): Promise<ApiResponse<OfflineIncome[]>> => {
	return getFromApi<OfflineIncome[]>(fetch, '/admin/offline-income', token);
};

export const createOfflineIncome = async (
	fetch: typeof window.fetch,
	data: Omit<OfflineIncome, 'id' | 'service'> & { serviceId: string },
	token: string
): Promise<ApiResponse<any>> => {
	return postToApi(fetch, '/admin/offline-income', data, token);
};

export const updateOfflineIncome = async (
	fetch: typeof window.fetch,
	id: string,
	data: Partial<OfflineIncome>,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, `/admin/offline-income/${id}`, data, token);
};

export const deleteOfflineIncome = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<any>> => {
	return deleteFromApi(fetch, `/admin/offline-income/${id}`, token);
};

// Expenses
export const getExpenses = async (
	fetch: typeof window.fetch,
	token: string
): Promise<ApiResponse<Expense[]>> => {
	return getFromApi<Expense[]>(fetch, '/admin/expenses', token);
};

export const createExpense = async (
	fetch: typeof window.fetch,
	data: Omit<Expense, 'id'>,
	token: string
): Promise<ApiResponse<any>> => {
	return postToApi(fetch, '/admin/expenses', data, token);
};

export const updateExpense = async (
	fetch: typeof window.fetch,
	id: string,
	data: Partial<Expense>,
	token: string
): Promise<ApiResponse<any>> => {
	return putToApi(fetch, `/admin/expenses/${id}`, data, token);
};

export const deleteExpense = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<any>> => {
	return deleteFromApi(fetch, `/admin/expenses/${id}`, token);
};

// Cash Flow Stats
export const getCashFlowStats = async (
	fetch: typeof window.fetch,
	token: string
): Promise<ApiResponse<CashFlowStats>> => {
	return getFromApi<CashFlowStats>(fetch, '/admin/cash-flow-stats', token);
};
