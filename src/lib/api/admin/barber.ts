import { faker } from '@faker-js/faker';
import type { Barber } from '$lib/types/adminTypes';
import { userId } from '$lib/zod/schema';

const barbers: Barber[] = Array.from({ length: 71 }, () => ({
	id: userId(),
	name: faker.person.fullName(),
	phoneNumber: `08${Math.floor(Math.random() * 100000000)}`,
	description: faker.lorem.paragraph(),
	skills: faker.lorem.paragraph(),
	experience: faker.lorem.paragraph()
}));

// Define the response type
interface BarberResponse {
	success: boolean;
	data?: Barber;
	error?: string;
}

export const getBarberById = (id: string): BarberResponse => {
	try {
		const barber = barbers.find((b) => b.id === id);

		if (!barber) {
			return {
				success: false,
				error: 'Barber not found'
			};
		}

		const cleanBarber: Barber = {
			id: barber.id,
			name: barber.name,
			phoneNumber: barber.phoneNumber,
			description: barber.description,
			skills: barber.skills,
			experience: barber.experience
		};

		return {
			success: true,
			data: cleanBarber
		};
	} catch (error) {
		return {
			success: false,
			error: 'Failed to fetch barber' + error
		};
	}
};

export const getBarber = () => {
	return {
		barbers
	};
};

export const editBarber = (updatedBarber: Barber): boolean => {
	const index = barbers.findIndex((b) => b.id === updatedBarber.id);
	if (index !== -1) {
		barbers[index] = updatedBarber;
		return true;
	}
	return false; // not found
};

export const createBarber = (newBarber: Barber): boolean => {
	try {
		barbers.push(newBarber); // actually add the new barber to the array
		return true;
	} catch (e) {
		console.error('Failed to create barber:', e);
		return false;
	}
};
