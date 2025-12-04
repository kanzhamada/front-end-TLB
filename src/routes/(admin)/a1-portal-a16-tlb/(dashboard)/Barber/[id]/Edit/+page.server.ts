import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { barberSchema, userId } from '$lib/zod/schema.js';
import { createBarber, editBarber } from '$lib/api/admin/barber.js';

const crudSchema = barberSchema.extend({
	id: barberSchema.shape.id.optional()
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(barberSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(crudSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const data = form.data;
			const token = locals.session?.access_token || '';

			if (data.id) {
				const updated = await editBarber(fetch, data.id, { ...data, id: data.id }, token);
				if (!updated.success) throw new Error(updated.message || 'Failed to update');
			} else {
				if (!data.id) data.id = userId();
				const created = await createBarber(fetch, { ...data, id: data.id }, token);
				if (!created.success) throw new Error(created.message || 'Failed to create');
			}

			return {
				form,
				success: true,
				message: 'Data berhasil tersimpan!'
			};
		} catch (error: any) {
			console.error(error);
			return fail(500, {
				form,
				message: error.message || 'Gagal menyimpan data',
				success: false
			});
		}
	}
};
