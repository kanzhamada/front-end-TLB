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
    const reservations: Reservation[] = Array.from({ length: 69 }, (_, index) => ({
        id: `id-${index + 1}`,
        customer: faker.person.fullName(),
        invoice: `INV-${Math.floor(Math.random() * 10000)}`,
        dateTime: new Date(
            2025,
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
        reservations
    };
}
