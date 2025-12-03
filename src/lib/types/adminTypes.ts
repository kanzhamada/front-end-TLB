export type Barber = {
	id: string;
	name: string;
	phoneNumber: string;
	description?: string;
	skills?: string;
	experience?: string;
	active?: boolean;
};

export type Reservation = {
	id: string;
	customer: string;
	invoice: string;
	dateTime: string;
	status: 'waiting-approve' | 'on-going' | 'completed' | 'canceled-by-user' | 'canceled-by-admin';
	amount: number;
};

export type Service = {
	id: string;
	name: string; // Changed from serviceName to match API
	price: number;
	description: string;
	attainableCoin?: number;
};

export type Voucher = {
	id: string;
	title: string;
	startDate: {
		date: string;
		time: string;
	};
	expiredDate: {
		date: string;
		time: string;
	};
	description: string;
	service: string;
	value: number;
};

export type Catalogue = {
	id: string;
	name: string;
	type: 'Long' | 'Short' | 'Medium';
	description: string;
	image: string;
};

export type OperationalTime = {
	id: string;
	date: string; // Changed structure to match API
	hour: string[];
};

// Finance Types
export type OfflineIncome = {
	id: string;
	date: string;
	type: 'Tunai' | 'QRIS';
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
	daily: CashFlowDetail;
	weekly: CashFlowDetail;
	monthly: CashFlowDetail;
};

export type CashFlowDetail = {
	offline_income: number;
	online_income: number;
	expenses: number;
	cash_flow: number;
};
