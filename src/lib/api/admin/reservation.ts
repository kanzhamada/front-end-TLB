// routes/payments/+page.server.ts
import type { Reservation } from '$lib/types/adminTypes';
import { faker } from '@faker-js/faker';

export const getReservations = () => {
	const statuses = [
		'waiting-approve',
		'on-going',
		'completed',
		'canceled-by-user',
		'canceled-by-admin'
	] as const;
	const reservations: Reservation[] = Array.from({ length: 269 }, (_, index) => ({
		id: `id-${index + 1}`,
		customer: faker.person.fullName(),
		invoice: `INV-${Math.floor(Math.random() * 10000)}`,
		dateTime: new Date(
			2020 + Math.floor(Math.random() * 6),
			Math.floor(Math.random() * 12),
			Math.floor(Math.random() * 28) + 1,
			Math.floor(Math.random() * 24),
			Math.floor(Math.random() * 60)
		)
			.toISOString()
			.slice(0, 16)
			.replace('T', ' '),
		status: statuses[Math.floor(Math.random() * statuses.length)],
		amount: Math.floor(Math.random() * 10000) + 1000
	}));

	return {
		reservations: reservations.sort(
			(a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
		)
	};
};

export const getLatestWaitingReservations = () => {
	const response = getReservations();
	const waitingReservations = response.reservations.filter((r) => r.status === 'waiting-approve');
	const latestThree = waitingReservations.slice(0, 3);
	return latestThree;
};
