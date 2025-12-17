// Reservation-related types

export type DateTime = {
	date: string;
	hour: string;
};

export type ReservationBarber = {
	name: string;
	phoneNumber: string;
};

export type ReservationService = {
	name: string;
	price: number;
};

export type ReservationResponse = {
	notes: string | null;
	barber: ReservationBarber;
	status: string;
	userID: string;
	invoice: string | null;
	service: ReservationService;
	dateTime: DateTime;
	newDateTime?: DateTime;
	serviceID: string;
	dateTimeID: string;
	reservationID: string;
	created_at?: string;
	updated_at?: string;
	voucherId?: string | null;
	voucherValue?: number;
	downPayment?: number;
	totalPayment?: number;
	fulfillmentStatus?: string;
	payment_method: string;
};

export type CreateReservationPayload = {
	barberId: string;
	serviceId: string;
	dateTimeId: string;
	notes?: string;
	voucherId?: string;
	redeemCode?: string;
	paymentMethod: string;
};

export type CreateReservationResponse = {
	id: string;
	customer_id: string;
	barber_id: string;
	service_id: string;
	date_time_id: string;
	status: string;
	notes?: string | null;
	voucher_id?: string | null;
	created_at?: string;
	updated_at?: string;
};

export type CancelReservationResponse = {
	reservationId: string;
	status: string;
	canceled_at: string;
};

export type RescheduleReservationResponse = {
	reservationId: string;
	newDateTimeId: string;
	updated_at: string;
};

export type CreateTransactionResponse = {
	token: string;
	redirect_url: string;
};
