import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { serviceSchema, userId } from '$lib/zod/schema.js';
import { createService, editService, getService } from '$lib/api/admin/service.js';

const crudSchema = serviceSchema.extend({
	id: serviceSchema.shape.id.optional()
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(serviceSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(crudSchema));

		const response = getService();
		const service = response.services;
		// let error = false;

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const data = form.data;

			if (data.id && service.find((b) => b.id === data.id)) {
				const updated = editService({ ...data, id: data.id as string });
				if (!updated) throw new Error('Failed to update');
			} else {
				// Assign ID if needed
				if (!data.id) data.id = userId();
				const created = createService({ ...data, id: data.id as string });
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
