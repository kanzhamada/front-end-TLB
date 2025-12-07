// src/lib/api/shared/api.ts
const API_URL = import.meta.env.PUBLIC_API_URL;

type Envelope<T> = {
	success?: boolean;
	sucess?: boolean; // Note: Typo might exist in API response
	message?: string;
	data?: T;
	error?: unknown;
};

export type ApiResponse<T> = {
	success: boolean;
	message?: string;
	data?: T;
	error?: unknown;
};

// --- Type Definitions ---
export type Service = {
	id: string;
	name: string;
	price: number;
	description: string;
	attainableCoin?: number | null;
};

export type Barber = {
	id: string;
	name: string;
	description?: string;
	experience?: string;
	skills?: string;
	phoneNumber?: string;
	active?: boolean;
	image?: string;
};

export type OperationalHourStatus = 'available' | 'booked' | 'unavailable';

export type OperationalHour = {
	id: string;
	rawTime: string;
	time: string;
	status: OperationalHourStatus;
};

export type OperationalDay = {
	id: string;
	date: string;
	hours: OperationalHour[];
};

export type OwnedVoucher = {
	voucherID: string;
	name?: string;
	title?: string;
	type?: string;
	discountPercentage?: number;
	discountAmount?: number;
	value?: number;
	description?: string;
	expiredAt?: string;
	expiredDate?: string;
	serviceID?: string;
	serviceName?: string;
	[key: string]: unknown;
};

export type Schedule = {
	day: string;
	hours: string[];
	created_at: string;
	updated_at: string;
};
// --- End Type Definitions ---

// --- Helper Functions ---
function createError<T>(message: string, error?: unknown): ApiResponse<T> {
	return {
		success: false,
		message,
		error
	};
}

// Update getFromApi to accept fetch and handle potential empty JSON bodies
export async function getFromApi<T>(
	fetch: typeof window.fetch, // Accept fetch as a parameter
	path: string,
	accessToken?: string
): Promise<ApiResponse<T>> {
	if (!API_URL) {
		return createError<T>('PUBLIC_API_URL is not configured');
	}

	try {
		// Use the passed-in fetch
		console.log(`[API Request] GET ${path}`, {
			url: `${API_URL}${path}`,
			hasToken: !!accessToken,
			tokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : 'none'
		});

		const response = await fetch(`${API_URL}${path}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
			}
		});

		console.log(`[API Response] GET ${path}`, {
			status: response.status,
			statusText: response.statusText,
			ok: response.ok
		});

		// Check if the response status indicates an error *before* trying to parse JSON
		// This is good practice anyway
		if (!response.ok) {
			// Attempt to read the body as text first, then try JSON if it looks like JSON
			let errorBody = {};
			try {
				const bodyText = await response.text(); // Read as text first
				// Only try to parse as JSON if the text is not empty and potentially valid JSON
				if (bodyText && bodyText.trim().startsWith('{')) {
					errorBody = JSON.parse(bodyText);
				} else {
					// If it's not JSON, use the raw text or the status text
					errorBody = { message: bodyText || response.statusText };
				}
			} catch (jsonError) {
				// If parsing the error body fails, use status text
				console.warn('Failed to parse error response body as JSON/text:', jsonError);
				errorBody = { message: response.statusText };
			}
			const message = (errorBody as { message?: string }).message ?? response.statusText;

			return {
				success: false,
				message,
				error: errorBody // Include the parsed error body or status text
			};
		}

		// If response is OK, proceed to parse JSON
		const json = (await response.json()) as Envelope<T>;
		const successFlag = Boolean(json.success ?? json.sucess); // Handle potential typo

		if (!successFlag) {
			return {
				success: false,
				message: json.message ?? 'Request failed',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		// This catch handles network errors, JSON parsing errors during success, etc.
		// If it was a network error or similar, the error object will be detailed.
		// If it was a JSON parsing error from an error response (handled above), this might not trigger,
		// but it's a safety net for other unexpected errors.
		if (error instanceof SyntaxError) {
			// This specific case might occur if the success response body was unexpectedly empty or non-JSON
			// though the status was 200 OK, which is unlikely given the 404 scenario.
			console.error('JSON Parse Error in getFromApi (success path):', error);
			return createError<T>('Failed to parse successful response as JSON', error);
		}
		// For other errors (e.g., network)
		return createError<T>('Failed to fetch data from API', error);
	}
}
// --- End Helper Functions ---

// --- Helper Functions for Mutations ---
async function sendToApi<T>(
	fetch: typeof window.fetch,
	method: 'POST' | 'PUT' | 'DELETE',
	path: string,
	data?: unknown,
	accessToken?: string
): Promise<ApiResponse<T>> {
	if (!API_URL) {
		return createError<T>('PUBLIC_API_URL is not configured');
	}

	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};
		if (accessToken) {
			headers['Authorization'] = `Bearer ${accessToken}`;
		}

		const options: RequestInit = {
			method,
			headers
		};

		console.log(`[API Request] ${method} ${path}`, {
			url: `${API_URL}${path}`,
			headers,
			hasToken: !!accessToken,
			tokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : 'none',
			data
		});

		if (data !== undefined) {
			options.body = JSON.stringify(data);
		}

		const response = await fetch(`${API_URL}${path}`, options);
		
		console.log(`[API Response] ${method} ${path}`, {
			status: response.status,
			statusText: response.statusText,
			ok: response.ok
		});

		if (!response.ok) {
			let errorBody = {};
			try {
				const bodyText = await response.text();
				console.log(`[API Error Body]`, bodyText);
				if (bodyText && bodyText.trim().startsWith('{')) {
					errorBody = JSON.parse(bodyText);
				} else {
					errorBody = { message: bodyText || response.statusText };
				}
			} catch (jsonError) {
				console.warn('Failed to parse error response body:', jsonError);
				errorBody = { message: response.statusText };
			}
			const message = (errorBody as { message?: string }).message ?? response.statusText;

			return {
				success: false,
				message,
				error: errorBody
			};
		}

		// Handle 204 No Content or empty responses
		if (response.status === 204) {
			return {
				success: true,
				message: 'Operation successful'
			};
		}

		const text = await response.text();
		if (!text) {
			return {
				success: true,
				message: 'Operation successful'
			};
		}

		const json = JSON.parse(text) as Envelope<T>;
		const successFlag = Boolean(json.success ?? json.sucess);

		if (!successFlag) {
			return {
				success: false,
				message: json.message ?? 'Request failed',
				error: json.error ?? json
			};
		}

		return {
			success: true,
			message: json.message,
			data: json.data
		};
	} catch (error) {
		return createError<T>(`Failed to ${method} data to API`, error);
	}
}

export async function postToApi<T>(
	fetch: typeof window.fetch,
	path: string,
	data: unknown,
	accessToken?: string
): Promise<ApiResponse<T>> {
	return sendToApi<T>(fetch, 'POST', path, data, accessToken);
}

export async function putToApi<T>(
	fetch: typeof window.fetch,
	path: string,
	data: unknown,
	accessToken?: string
): Promise<ApiResponse<T>> {
	return sendToApi<T>(fetch, 'PUT', path, data, accessToken);
}

export async function deleteFromApi<T>(
	fetch: typeof window.fetch,
	path: string,
	accessToken?: string
): Promise<ApiResponse<T>> {
	return sendToApi<T>(fetch, 'DELETE', path, undefined, accessToken);
}

// --- API Functions ---
// Update API functions to accept fetch
export const getServices = async (fetch: typeof window.fetch): Promise<ApiResponse<Service[]>> => {
	// Pass fetch to getFromApi
	type RawService = {
		serviceID: string;
		name: string;
		price: number;
		description: string;
		attainableCoin?: number | null;
	};
	// Get the raw data
	const result = await getFromApi<RawService[]>(fetch, '/shared/view-service'); // Pass fetch first

	// Check for success and data existence/emptiness using the raw data type
	// Consider empty array [] as a failure condition for this specific use case
	if (!result.success || !result.data || result.data.length === 0) {
		// Return the result as-is, but ensure data is typed as Service[] | undefined
		// Since success is false, data is missing, or data is empty, data should be undefined
		return {
			...result,
			data: undefined // Explicitly ensure data is undefined if it was missing, empty, or success was false
		} as ApiResponse<Service[]>;
	}

	// Map the raw data to the desired type (only reached if data exists and is not empty)
	const services: Service[] = result.data.map((service) => ({
		id: service.serviceID,
		name: service.name,
		price: service.price,
		description: service.description,
		attainableCoin: service.attainableCoin ?? null
	}));

	// Return the success response with the mapped data
	return {
		success: true,
		message: result.message,
		data: services // This is now Service[]
	};
};

export const getBarbers = async (fetch: typeof window.fetch): Promise<ApiResponse<Barber[]>> => {
	type RawBarber = {
		barberID: string;
		name: string;
		description?: string;
		experience?: string;
		skills?: string;
		phoneNumber?: string;
	};

	const result = await getFromApi<RawBarber[]>(fetch, '/shared/view-barber');

	// Check for success and data existence/emptiness
	if (!result.success || !result.data || result.data.length === 0) {
		return {
			...result,
			data: undefined // Explicitly set data to undefined
		} as ApiResponse<Barber[]>;
	}

	const barbers: Barber[] = result.data.map((barber) => ({
		id: barber.barberID,
		name: barber.name,
		description: barber.description,
		experience: barber.experience,
		skills: barber.skills,
		phoneNumber: barber.phoneNumber
	}));

	return {
		success: true,
		message: result.message,
		data: barbers
	};
};

export const getOperational = async (
	fetch: typeof window.fetch
): Promise<ApiResponse<OperationalDay[]>> => {
	type RawOperational = {
		date: string;
		dateID: string;
		hourDetail: { hour: string; hourID: string; status?: string | null }[];
	};

	const result = await getFromApi<RawOperational[]>(fetch, '/shared/view-operational');

	// Check for success and data existence/emptiness
	if (!result.success || !result.data || result.data.length === 0) {
		// Return the result as-is, but ensure data is typed as OperationalDay[] | undefined
		// Since success is false, data is missing, or data is empty, data should be undefined
		return {
			...result,
			data: undefined // Explicitly ensure data is undefined if it was missing, empty, or success was false
		} as ApiResponse<OperationalDay[]>;
	}

	const availability: OperationalDay[] = result.data.map((entry) => ({
		id: entry.dateID,
		date: entry.date,
		hours: entry.hourDetail.map((hour) => {
			let status: OperationalHourStatus = 'unavailable';
			if (hour.status === 'available') status = 'available';
			else if (hour.status === 'booked') status = 'booked';

			const formatted = hour.hour?.slice(0, 5) ?? hour.hour;
			return {
				id: hour.hourID,
				rawTime: hour.hour,
				time: formatted,
				status
			};
		})
	}));

	return {
		success: true,
		message: result.message,
		data: availability
	};
};

export const getSchedule = async (fetch: typeof window.fetch): Promise<ApiResponse<Schedule[]>> => {
	const result = await getFromApi<Schedule[]>(fetch, '/shared/view-schedule');

	if (!result.success || !result.data || result.data.length === 0) {
		return {
			...result,
			data: undefined
		} as ApiResponse<Schedule[]>;
	}

	return {
		success: true,
		message: result.message,
		data: result.data
	};
};

export const getOwnedVouchers = async (
	fetch: typeof window.fetch, // Accept fetch
	accessToken: string
): Promise<ApiResponse<OwnedVoucher[]>> => {
	// Pass fetch to getFromApi
	// The return type of getFromApi<OwnedVoucher[]> should be compatible
	const result = await getFromApi<OwnedVoucher[]>(
		fetch,
		'/customer/view-owned-voucher',
		accessToken
	);

	// For vouchers, an empty array might be a valid state (user has no vouchers).
	// If you want empty vouchers to be considered a failure, uncomment the next line.
	// if (!result.success || !result.data || result.data.length === 0) {
	// If you consider an empty list of vouchers as a successful response (which is common),
	// just check for success and data existence.
	if (!result.success || result.data === undefined) {
		// Check for undefined explicitly if needed, or allow empty []
		// Ensure data is undefined if it was missing, to satisfy ApiResponse<OwnedVoucher[]> type
		// The result from getFromApi already has the correct structure (success: false, message, error)
		return {
			...result, // Includes success: false, message, error from getFromApi (if applicable)
			data: undefined // Explicitly set data to undefined for failure cases
		} as ApiResponse<OwnedVoucher[]>;
	}

	// If successful and data exists (could be an empty array []), return the result.
	// The `loadReservationData` function will handle an empty array of vouchers gracefully.
	return {
		...result // Includes success: true, message, and data (which could be [])
	};
};

export type CatalogueImage = {
	imageUrl: string;
};

export type Catalogue = {
	catalogueID: string;
	name: string;
	type: string;
	description: string;
	catalogueImages: CatalogueImage[];
};

export const getCatalogue = async (
	fetch: typeof window.fetch
): Promise<ApiResponse<Catalogue[]>> => {
	const result = await getFromApi<Catalogue[]>(fetch, '/shared/view-catalogue');

	if (!result.success || !result.data) {
		return {
			...result,
			data: undefined
		} as ApiResponse<Catalogue[]>;
	}

	return {
		success: true,
		message: result.message,
		data: result.data
	};
};

export const getCatalogueById = async (
	fetch: typeof window.fetch,
	id: string
): Promise<ApiResponse<Catalogue>> => {
	const result = await getFromApi<Catalogue>(fetch, `/shared/view-catalogue/${id}`);

	if (!result.success || !result.data) {
		return {
			...result,
			data: undefined
		} as ApiResponse<Catalogue>;
	}

	return {
		success: true,
		message: result.message,
		data: result.data
	};
};
// --- End API Functions ---
