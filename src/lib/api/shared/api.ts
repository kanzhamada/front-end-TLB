/**
 * Shared API functions for customer-facing pages
 */

interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
	error?: string;
}

interface Service {
	id: string;
	name: string;
	price: number;
	description: string;
}

interface ScheduleDay {
	day: string;
	hours: string[];
}

/**
 * Fetch services list from the API
 */
export const getServices = async (): Promise<ApiResponse<Service[]>> => {
	try {
		const apiUrl = import.meta.env.PUBLIC_API_URL;
		if (!apiUrl) {
			return {
				success: false,
				error: 'API URL not configured'
			};
		}

		const response = await fetch(`${apiUrl}/shared/view-service`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const result = await response.json();
			return result;
		} else {
			return {
				success: false,
				error: `Failed to fetch services: ${response.statusText}`
			};
		}
	} catch (error) {
		return {
			success: false,
			error: `Failed to fetch services: ${error}`
		};
	}
};

/**
 * Fetch operational schedule from the API
 */
export const getSchedule = async (): Promise<ApiResponse<ScheduleDay[]>> => {
	try {
		const apiUrl = import.meta.env.PUBLIC_API_URL;
		if (!apiUrl) {
			return {
				success: false,
				error: 'API URL not configured'
			};
		}

		const response = await fetch(`${apiUrl}/shared/view-schedule`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const result = await response.json();
			return result;
		} else {
			return {
				success: false,
				error: `Failed to fetch schedule: ${response.statusText}`
			};
		}
	} catch (error) {
		return {
			success: false,
			error: `Failed to fetch schedule: ${error}`
		};
	}
};

export type { Service, ScheduleDay, ApiResponse };

