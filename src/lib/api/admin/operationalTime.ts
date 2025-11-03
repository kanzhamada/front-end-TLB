import { type OperationalTime } from '$lib/types/adminTypes';
import { userId } from '$lib/zod/schema';
import { faker } from '@faker-js/faker';

const operationalTimes: OperationalTime[] = Array.from({ length: 69 }, () => ({
	id: userId(),
	dateTime: new Date(
		2025,
		Math.floor(Math.random() * 12),
		Math.floor(Math.random() * 28) + 1,
		Math.floor(Math.random() * 24),
		Math.floor(Math.random() * 60)
	)
		.toISOString()
		.slice(0, 16)
		.replace('T', ' ')
}));

interface OperationalTimeResponse {
	success: boolean;
	data?: OperationalTime;
	error?: string;
}

export const getOperationalTimeById = (id: string): OperationalTimeResponse => {
	try {
		const operationalTime = operationalTimes.find((b) => b.id === id);

		if (!operationalTime) {
			return {
				success: false,
				error: 'OperationalTime not found'
			};
		}

		const cleanOperationalTime: OperationalTime = {
			id: operationalTime.id,
			dateTime: operationalTime.dateTime
		};

		return {
			success: true,
			data: cleanOperationalTime
		};
	} catch (error) {
		return {
			success: false,
			error: 'Failed to fetch operationalTime' + error
		};
	}
};

export const getOperationalTime = () => {
	return {
		operationalTimes
	};
};

export const editOperationalTime = (updatedOperationalTime: OperationalTime): boolean => {
	const index = operationalTimes.findIndex((b) => b.id === updatedOperationalTime.id);
	if (index !== -1) {
		operationalTimes[index] = updatedOperationalTime;
		return true;
	}
	return false; // not found
};

export const createOperationalTime = (newOperationalTime: OperationalTime): boolean => {
	try {
		operationalTimes.push(newOperationalTime); // actually add the new OperationalTime to the array
		return true;
	} catch (e) {
		console.error('Failed to create OperationalTime:', e);
		return false;
	}
};
