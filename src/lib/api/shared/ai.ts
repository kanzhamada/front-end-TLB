
import { type ApiResponse } from '$lib/api/shared/api';

const HUGGINGFACE_MODEL_URL = import.meta.env.PUBLIC_HUGGINGFACE_MODEL_URL;
const HUGGINGFACE_API_KEY = import.meta.env.PUBLIC_HUGGINGFACE_API_KEY;

export type AIAnalysisResult = {
	wajah?: string;
	rambut?: string;
	skin?: string;
	c_wajah?: string;
	c_rambut?: string;
	c_skin?: string;
	katalog?: Array<{
		nama_gaya: string;
		tipe: string;
		deskripsi: string;
		gambar_url: string;
	}>;
};

export const analyzeImage = async (
	fetch: typeof window.fetch,
	imageBlob: Blob
): Promise<ApiResponse<AIAnalysisResult>> => {
	try {
		console.log('AI Analyze Request Initiated (Client-Side)');
		
		if (!HUGGINGFACE_MODEL_URL || !HUGGINGFACE_API_KEY) {
			console.error('Missing Public HuggingFace Configuration');
			return {
				success: false,
				error: 'Configuration Error: Missing Public API Keys'
			};
		}

		const formData = new FormData();
		// HuggingFace Inference API typically expects the file with key 'file' or just the binary body
		// The previous server code used 'file' key.
		formData.append('file', imageBlob, 'image.jpg');

		const response = await fetch(HUGGINGFACE_MODEL_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${HUGGINGFACE_API_KEY}`
				// Content-Type is set automatically by fetch for FormData
			},
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('HF API Error:', errorText);
			return {
				success: false,
				error: `HF API Error: ${response.status} ${errorText}`
			};
		}

		const result = await response.json();
		console.log('HF API Result:', result);

		if (result && result.error) {
			return {
				success: false,
				error: `Model Error: ${result.error}`
			};
		}

		return {
			success: true,
			data: result
		};
	} catch (error: any) {
		console.error('AI Analysis Error:', error);
		return {
			success: false,
			error: error.message || 'An unexpected error occurred during analysis.'
		};
	}
};
