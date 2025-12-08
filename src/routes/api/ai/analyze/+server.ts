import { HUGGINGFACE_API_KEY, HUGGINGFACE_MODEL_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        console.log('AI Analyze Request Recieved');
        const data = await request.formData();
        const image = data.get('image');

        if (!image || !(image instanceof Blob)) {
            console.log('No valid image provided');
            return json({ success: false, error: 'No image provided' }, { status: 400 });
        }

        console.log('Image received, size:', image.size);
        console.log('Using API URL:', HUGGINGFACE_MODEL_URL ? 'Defined' : 'Missing');
        console.log('Using API Key:', HUGGINGFACE_API_KEY ? 'Defined' : 'Missing');

        // STRATEGY: Try Multipart/Form-Data (The "No file" error suggests it wants a file upload)
        const upstreamFormData = new FormData();
        upstreamFormData.append('file', image, 'image.jpg'); // Try 'file' as key, common in python/flask

        const response = await fetch(HUGGINGFACE_MODEL_URL, {
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                // Do NOT set Content-Type manually for FormData, fetch does it with boundary
            },
            method: 'POST',
            body: upstreamFormData
        });

        console.log('HF Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('HF API Error Relayed:', errorText);
            return json({ success: false, error: `HF API Error: ${response.status} ${errorText}` }, { status: response.status });
        }

        const result = await response.json();
        console.log('HF API Result:', JSON.stringify(result, null, 2));

        if (result && result.error) {
            console.error('HF API Business Error:', result.error);
            return json({ success: false, error: `Model Error: ${result.error}` }, { status: 400 });
        }

        return json({ success: true, data: result });
    } catch (error) {
        console.error('Server Error:', error);
        return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
