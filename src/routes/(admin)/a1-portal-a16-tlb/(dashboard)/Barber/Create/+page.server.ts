import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { barberSchema, userId } from '$lib/zod/schema.js';
import { createBarber, editBarber, getBarbers } from '$lib/api/admin/barber.ts';

const crudSchema = barberSchema.extend({
	id: barberSchema.shape.id.optional()
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(barberSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(crudSchema));

		const response = getBarbesr();
		const barber = response;
		console.log('formData:', Object.fromEntries(formData));
		console.log('form:', form);
		// let error = false;

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const data = form.data;

			if (data.id && barber.find((b) => b.id === data.id)) {
				const updated = editBarber({ ...data, id: data.id as string });
				if (!updated) throw new Error('Failed to update');
			} else {
				// Assign ID if needed
				if (!data.id) data.id = userId();
				console.log('data.id:', data.id);
				const created = createBarber({ ...data, id: data.id as string });
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
