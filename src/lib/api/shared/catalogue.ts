import type { Catalogue } from '$lib/types/adminTypes';
import { userId } from '$lib/zod/schema';
import { faker } from '@faker-js/faker';

const catalogues: Catalogue[] = Array.from({ length: 69 }, () => ({
	id: userId(),
	name: faker.word.noun(),
	type: faker.helpers.arrayElement(['Long', 'Short', 'Medium']),
	description: faker.lorem.paragraph(),
	image: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.image.url())
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