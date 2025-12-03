import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { catalogueSchema, userId } from '$lib/zod/schema.js';
import { editCatalogue, getCatalogueById } from '$lib/api/admin/catalogue.js';

const crudSchema = catalogueSchema.extend({
	id: catalogueSchema.shape.id.optional()
});

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id } = params;
	const res = await getCatalogueById(fetch, id);
	
	if (!res.success || !res.data) {
		// Handle error or redirect
		return {
			form: await superValidate(zod(catalogueSchema)),
			error: 'Catalogue not found'
		};
	}

	return {
		form: await superValidate(res.data, zod(catalogueSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params, fetch }) => {
		const { id } = params;
		const formData = await request.formData();
		const form = await superValidate(formData, zod(crudSchema));

		if (!form.valid) {
			return fail(400, { form, message: 'Invalid form data', success: false });
		}

		const token = locals.session?.access_token;
		if (!token) {
			return fail(401, { form, message: 'Unauthorized', success: false });
		}

		try {
			// For edit, file is optional if not changing image
			// But API might expect it? 
			// If API expects multipart, we send formData.
			// If file is empty/missing in formData, the backend should handle it (keep old image).
			// We pass the whole formData.
			
			const response = await editCatalogue(fetch, id, formData, token);

			if (!response.success) {
				return fail(400, { 
					form, 
					message: response.message || 'Failed to update catalogue', 
					success: false 
				});
			}

			return {
				form,
				success: true,
				message: 'Catalogue updated successfully!'
			};
		} catch (error: any) {
			console.error(error);
			return fail(500, {
				form,
				message: error.message || 'Internal Server Error',
				success: false
			});
		}
	}
};
