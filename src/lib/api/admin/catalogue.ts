import {
	getFromApi,
	postToApi,
	putToApi,
	deleteFromApi,
	type ApiResponse
} from '$lib/api/shared/api';

// We need to keep the mutations here.

export { getCatalogues, getCatalogueById, type Catalogue } from '$lib/api/shared/catalogue';
import type { Catalogue } from '$lib/api/shared/catalogue';

const API_URL = import.meta.env.PUBLIC_API_URL;

// ... mutations follow ...

export const createCatalogue = async (
	fetch: typeof window.fetch,
	formData: FormData,
	token: string
): Promise<ApiResponse<Catalogue>> => {
	if (!API_URL) {
		return { success: false, message: 'PUBLIC_API_URL is not configured' };
	}

	try {
		const response = await fetch(`${API_URL}/admin/create-catalogue`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`
				// Content-Type is automatically set by browser for FormData
			},
			body: formData
		});

		const json = await response.json();
		if (!response.ok || !json.success) {
			return {
				success: false,
				message: json.message || 'Failed to create catalogue',
				error: json.error
			};
		}

		return {
			success: true,
			message: json.message,
			data: {
				id: json.data.catalogueID || json.data.id,
				name: json.data.name,
				type: json.data.type,
				description: json.data.description,
				image: json.data.catalogueImages?.[0]?.imageUrl || json.data.imageUrl || '',
<<<<<<< HEAD
				catalogueImages: json.data.catalogueImages || [],
				hairTypes: json.data.hairTypes,
				faceShapes: json.data.faceShapes,
				skinTones: json.data.skinTones
=======
				catalogueImages: json.data.catalogueImages || []
>>>>>>> 6197886 (merge redesign customer with admin dashboard)
			}
		};
	} catch (error) {
		return { success: false, message: 'Network error', error };
	}
};

export const editCatalogue = async (
	fetch: typeof window.fetch,
	id: string,
	formData: FormData,
	token: string
): Promise<ApiResponse<Catalogue>> => {
	if (!API_URL) {
		return { success: false, message: 'PUBLIC_API_URL is not configured' };
	}

	try {
		const response = await fetch(`${API_URL}/admin/update-catalogue/${id}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`
			},
			body: formData
		});

		const json = await response.json();
		if (!response.ok || !json.success) {
			return {
				success: false,
				message: json.message || 'Failed to update catalogue',
				error: json.error
			};
		}

		return {
			success: true,
			message: json.message,
			data: {
				id: json.data.catalogueID || json.data.id,
				name: json.data.name,
				type: json.data.type,
				description: json.data.description,
				image: json.data.catalogueImages?.[0]?.imageUrl || json.data.imageUrl || '',
<<<<<<< HEAD
				catalogueImages: json.data.catalogueImages || [],
				hairTypes: json.data.hairTypes,
				faceShapes: json.data.faceShapes,
				skinTones: json.data.skinTones
=======
				catalogueImages: json.data.catalogueImages || []
>>>>>>> 6197886 (merge redesign customer with admin dashboard)
			}
		};
	} catch (error) {
		return { success: false, message: 'Network error', error };
	}
};

export const deleteCatalogue = async (
	fetch: typeof window.fetch,
	id: string,
	token: string
): Promise<ApiResponse<void>> => {
	return deleteFromApi<void>(fetch, `/admin/delete-catalogue/${id}`, token);
};
