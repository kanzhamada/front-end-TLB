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
	recaptchaToken?: string;
};

type RegisterPayload = {
	email: string;
	password: string;
	displayName: string;
	phone?: string;
};

async function request<T>(path: string, payload?: unknown, token?: string): Promise<T> {
	console.log('API_URL:', API_URL); // Debug API URL

	if (!API_URL) {
		throw new Error('PUBLIC_API_URL is not defined');
	}

	const headers: HeadersInit = {
		'Content-Type': 'application/json'
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	try {
		const options: RequestInit = {
			method: 'POST',
			headers
		};

		if (payload) {
			options.body = JSON.stringify(payload);
		}

		// For logout, empty body is fine, but we need to verify if payload is undefined we don't send it? 
		// Actually fetch with POST usually expects body or content-length 0.
		// If payload is explicitly provided (even null), JSON.stringify might be needed or not.
		// Let's stick to simple logic: if payload present, stringify.

		const response = await fetch(`${API_URL}${path}`, options);

		console.log('Response status:', response.status);

		const json = (await response.json()) as T;
		console.log('Response data:', json);

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

export const logout = (token: string) => request<AuthResponse>('/auth/logout', null, token);

export const updatePassword = (payload: {
	access_token: string;
	refresh_token: string;
	expires_in: string;
	expires_at: string;
	token_type: string;
	type: string;
	newPassword: string;
	recaptchaToken?: string;
}) => request<AuthResponse>('/auth/update-password', payload);

export type { LoginPayload, RegisterPayload, AuthResponse };
