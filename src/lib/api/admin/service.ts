import type { Service } from '$lib/types/adminTypes';
import { userId } from '$lib/zod/schema';
import { faker } from '@faker-js/faker';

const services: Service[] = Array.from({ length: 69 }, () => ({
	id: userId(),
	serviceName: faker.word.noun(),
	price: Math.floor(Math.random() * 10000) + 1000,
	description: faker.lorem.paragraph()
}));

interface ServiceResponse {
	success: boolean;
	data?: Service;
	error?: string;
}

export const getServiceById = (id: string): ServiceResponse => {
	try {
		const service = services.find((b) => b.id === id);

		if (!service) {
			return {
				success: false,
				error: 'Service not found'
			};
		}

		const cleanService: Service = {
			id: service.id,
			serviceName: service.serviceName,
			price: service.price,
			description: service.description
		};

		return {
			success: true,
			data: cleanService
		};
	} catch (error) {
		return {
			success: false,
			error: 'Failed to fetch service' + error
		};
	}
};

export const getService = () => {
	return {
		services
	};
};

export const editService = (updatedService: Service): boolean => {
	const index = services.findIndex((b) => b.id === updatedService.id);
	if (index !== -1) {
		services[index] = updatedService;
		return true;
	}
	return false; // not found
};

export const createService = (newService: Service): boolean => {
	try {
		services.push(newService); // actually add the new Service to the array
		return true;
	} catch (e) {
		console.error('Failed to create Service:', e);
		return false;
	}
};
