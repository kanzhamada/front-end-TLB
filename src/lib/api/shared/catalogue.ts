import { getFromApi, type ApiResponse } from '$lib/api/shared/api';

export type Catalogue = {
	id: string;
	name: string;
	type: string;
	description: string;
	image: string; // Fallback or first image
	catalogueImages: { imageID?: string; imageUrl: string }[];
<<<<<<< HEAD
	hairTypes?: string;
	faceShapes?: string;
	skinTones?: string;
=======
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
};

export const getCatalogues = async (
	fetch: typeof window.fetch,
	token?: string
): Promise<ApiResponse<Catalogue[]>> => {
	console.log('Fetching catalogues from /shared/view-catalogue');
	const result = await getFromApi<any[]>(fetch, '/shared/view-catalogue', token);
	console.log('Get catalogues result:', result);

	if (!result.success || !result.data) {
		return {
			success: false,
			message: result.message,
			error: result.error
		};
	}

	if (result.data.length > 0) {
		console.log('First catalogue item:', result.data[0]);
	}

	const catalogues: Catalogue[] = result.data.map((item) => ({
		id: item.catalogueID || item.id,
		name: item.name,
		type: item.type,
		description: item.description,
		image: item.catalogueImages?.[0]?.imageUrl || item.imageUrl || '',
<<<<<<< HEAD
		catalogueImages: item.catalogueImages || [],
		hairTypes: item.hairTypes,
		faceShapes: item.faceShapes,
		skinTones: item.skinTones
=======
		catalogueImages: item.catalogueImages || []
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
	}));

	return {
		success: true,
		message: result.message,
		data: catalogues
	};
};

export const getCatalogueById = async (
	fetch: typeof window.fetch,
	id: string
): Promise<ApiResponse<Catalogue>> => {
	const result = await getFromApi<any>(fetch, `/shared/view-catalogue/${id}`);

	if (!result.success || !result.data) {
		return {
			success: false,
			message: result.message,
			error: result.error
		};
	}

	const item = result.data;
	const catalogue: Catalogue = {
		id: item.catalogueID || item.id,
		name: item.name,
		type: item.type,
		description: item.description,
		image: item.catalogueImages?.[0]?.imageUrl || item.imageUrl || '',
<<<<<<< HEAD
		catalogueImages: item.catalogueImages || [],
		hairTypes: item.hairTypes,
		faceShapes: item.faceShapes,
		skinTones: item.skinTones
=======
		catalogueImages: item.catalogueImages || []
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
	};

	return {
		success: true,
		data: catalogue
	};
};