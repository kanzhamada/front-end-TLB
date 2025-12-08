import type { Session } from '$lib/stores/auth';

const API_URL = import.meta.env.PUBLIC_API_URL;

type AuthResponse = {
	success?: boolean;
	sucess?: boolean;
	message?: string;
	data?: {
		session: Session;
	};
	error?: unknown;
};

type LoginPayload = {
	email: string;
	password: string;
};

type RegisterPayload = {
	email: string;
	password: string;
	displayName: string;
	phone?: string;
};

async function request<T>(path: string, payload: unknown): Promise<T> {
	console.log('API_URL:', API_URL); // Debug API URL

	if (!API_URL) {
		throw new Error('PUBLIC_API_URL is not defined');
	}

	try {
		const response = await fetch(`${API_URL}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		console.log('Response status:', response.status); // Debug response status

		const json = (await response.json()) as T;
		console.log('Response data:', json); // Debug response status

		if (!response.ok) {
			throw Object.assign(new Error(`Request failed: ${response.status}`), {
				response: json,
				status: response.status
			});
		}

		return json;
	} catch (error) {
		console.error('Fetch error:', error);
		throw error;
	}
}



export const login = (payload: LoginPayload) => request<AuthResponse>('/auth/login', payload);

export const register = (payload: RegisterPayload) =>
	request<AuthResponse>('/auth/register', payload);

export const forgotPassword = (payload: { email: string, isAdmin?: boolean }) =>
	request<AuthResponse>('/auth/forgot-password', payload);

export const updatePassword = (payload: {
	access_token: string;
	refresh_token: string;
	expires_in: string;
	expires_at: string;
	token_type: string;
	type: string;
	newPassword: string;
}) => request<AuthResponse>('/auth/update-password', payload);

export type { LoginPayload, RegisterPayload, AuthResponse };
