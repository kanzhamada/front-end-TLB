import { browser } from '$app/environment';
import { getOperational, getServices } from '$lib/api/shared/api';

export const load = async () => {
	// Only run on client side since SSR is disabled
	if (browser) {
		try {
			// Fetch services and schedule in parallel
			const [servicesResponse, scheduleResponse] = await Promise.all([
				getServices(),
				getOperational()
			]);

			// Return data with fallbacks for errors
			return {
				services: servicesResponse.success ? servicesResponse.data : [],
				schedule: scheduleResponse.success ? scheduleResponse.data : [],
				error: {
					services: servicesResponse.error,
					schedule: scheduleResponse.error
				}
			};
		} catch (error) {
			console.error('Error loading page data:', error);
			return {
				services: [],
				schedule: [],
				error: {
					services: 'Failed to load services',
					schedule: 'Failed to load schedule'
				}
			};
		}
	}

	// Return empty data for SSR
	return {
		services: [],
		schedule: [],
		error: {
			services: undefined,
			schedule: undefined
		}
	};
};
