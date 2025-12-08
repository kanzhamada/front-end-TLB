
export interface WebsiteSettings {
	id?: string;
	admin_fee: number;
	vision: string;
	mission: string;
	location: string;
	maps_link: string;
	phone: string;
	instagram: string;
	updated_at?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getSettings(fetch: any): Promise<{ success: boolean; message: string; data?: WebsiteSettings }> {
	try {
		const res = await fetch(`${API_URL}/shared/settings`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const data = await res.json();
		return data;
	} catch (error) {
		console.error('Error fetching settings:', error);
		return { success: false, message: 'Network error' };
	}
}

export async function updateSettings(fetch: any, settings: WebsiteSettings, token: string): Promise<{ success: boolean; message: string; data?: WebsiteSettings }> {
	try {
		const res = await fetch(`${API_URL}/admin/settings`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(settings)
		});

		const data = await res.json();
		return data;
	} catch (error) {
		console.error('Error updating settings:', error);
		return { success: false, message: 'Network error' };
	}
}
