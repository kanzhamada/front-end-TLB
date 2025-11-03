import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { catalogueSchema, userId } from '$lib/zod/schema.js';
import { createCatalogue, editCatalogue, getCatalogue } from '$lib/api/admin/catalogue.js';

const crudSchema = catalogueSchema.extend({
	id: catalogueSchema.shape.id.optional()
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(catalogueSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		console.log('formData:', Object.fromEntries(formData));
		const form = await superValidate(formData, zod(crudSchema));
		console.log('form:', form);

		const response = getCatalogue();
		const catalogue = response.catalogues;

		// let error = false;

		if (!form.valid) {
			return fail(400, { form, message: 'Gagal menyimpan data', success: false });
		}

		try {
			const data = form.data;

			if (data.id && catalogue.find((b) => b.id === data.id)) {
				const updated = editCatalogue({ ...data, id: data.id as string });
				if (!updated) throw new Error('Failed to update');
			} else {
				// Assign ID if needed
				if (!data.id) data.id = userId();
				const created = createCatalogue({ ...data, id: data.id as string });
				if (!created) throw new Error('Failed to create');
			}

			return {
				form,
				success: true,
				message: 'Data berhasil tersimpan!'
			};
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				message: 'Gagal menyimpan data',
				success: false
			});
		}
	}
};
