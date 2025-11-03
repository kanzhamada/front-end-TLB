import type { Catalogue } from '$lib/types/adminTypes';
import { userId } from '$lib/zod/schema';
import { faker } from '@faker-js/faker';

const catalogues: Catalogue[] = Array.from({ length: 69 }, () => ({
	id: userId(),
	name: faker.word.noun(),
	type: faker.helpers.arrayElement(['Long', 'Short', 'Medium']),
	description: faker.lorem.paragraph(),
	image: faker.image.url()
}));

interface CatalogueResponse {
	success: boolean;
	data?: Catalogue;
	error?: string;
}

export const getCatalogueById = (id: string): CatalogueResponse => {
	try {
		const catalogue = catalogues.find((b) => b.id === id);

		if (!catalogue) {
			return {
				success: false,
				error: 'Catalogue not found'
			};
		}

		const cleanCatalogue: Catalogue = {
			id: catalogue.id,
			name: catalogue.name,
			type: catalogue.type,
			description: catalogue.description,
			image: catalogue.image
		};

		return {
			success: true,
			data: cleanCatalogue
		};
	} catch (error) {
		return {
			success: false,
			error: 'Failed to fetch catalogue' + error
		};
	}
};

export const getCatalogue = () => {
	return {
		catalogues
	};
};

export const editCatalogue = (updatedCatalogue: Catalogue): boolean => {
	const index = catalogues.findIndex((b) => b.id === updatedCatalogue.id);
	if (index !== -1) {
		catalogues[index] = updatedCatalogue;
		return true;
	}
	return false; // not found
};

export const createCatalogue = (newCatalogue: Catalogue): boolean => {
	try {
		catalogues.push(newCatalogue); // actually add the new Catalogue to the array
		return true;
	} catch (e) {
		console.error('Failed to create Catalogue:', e);
		return false;
	}
};
