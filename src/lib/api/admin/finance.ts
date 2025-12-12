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
	category?: string;
};

export type RevenueBreakdown = {
	total: number;
	online: {
		total: number;
		downPayment: number;
		settlement: number;
	};
	offline: {
		total: number;
		cash: number;
		qris: number;
	};
};

export type ExpenseBreakdown = {
	total: number;
};

export type CashFlowPeriodStats = {
	revenue: RevenueBreakdown;
	expenses: ExpenseBreakdown;
	netProfit: number;
};

// Chart Types
export type ChartItem = {
	label: string;
	revenue: number;
	expenses: number;
};

export type CashFlowStats = {
	daily: CashFlowPeriodStats;
	weekly: CashFlowPeriodStats;
	monthly: CashFlowPeriodStats;
	charts: {
		weekly: ChartItem[];
		monthly: ChartItem[];
		yearly: ChartItem[];
	};
};

// Unified Income History
export type UnifiedIncomeItem = {
	id: string;
	date: string;
	source: 'Online' | 'Offline';
	type: string;
	amount: number;
	description: string;
};

// ... existing offline income functions ...

export const getUnifiedIncome = async (
	fetch: typeof window.fetch,
	token: string,
	startDate?: string,
	endDate?: string
): Promise<ApiResponse<UnifiedIncomeItem[]>> => {
	let path = '/admin/income';
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	
	const queryString = params.toString();
	if (queryString) path += `?${queryString}`;

	return getFromApi<UnifiedIncomeItem[]>(fetch, path, token);
};

// Offline Income
export const getOfflineIncome = async (
	fetch: typeof window.fetch,
	token: string,
	startDate?: string,
	endDate?: string
): Promise<ApiResponse<OfflineIncome[]>> => {
	let path = '/admin/offline-income';
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	
	const queryString = params.toString();
	if (queryString) path += `?${queryString}`;

	return getFromApi<OfflineIncome[]>(fetch, path, token);
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
	token: string,
	startDate?: string,
	endDate?: string
): Promise<ApiResponse<Expense[]>> => {
	let path = '/admin/expenses';
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	
	const queryString = params.toString();
	if (queryString) path += `?${queryString}`;

	return getFromApi<Expense[]>(fetch, path, token);
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
