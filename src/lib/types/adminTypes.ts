export type Barber = {
	id: string;
	name: string;
	phoneNumber: string;
	description?: string;
	skills?: string;
	experience?: string;
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
	serviceName: string;
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
	dateTime: {
		date: string;
		time: string[];
	};
};
