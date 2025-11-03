import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { operationalTimeSchema, userId } from '$lib/zod/schema.js';
import {
	createOperationalTime,
	editOperationalTime,
	getOperationalTime
} from '$lib/api/admin/operationalTime.js';

const crudSchema = operationalTimeSchema.extend({
	id: operationalTimeSchema.shape.id.optional()
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(operationalTimeSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		console.log('formData:', Object.fromEntries(formData));
		const form = await superValidate(formData, zod(operationalTimeSchema));
		console.log('form:', form);

		const response = getOperationalTime();
		const operationalTime = response.operationalTimes;

		// let error = false;

		if (!form.valid) {
			return fail(400, { form, message: 'Gagal menyimpan data', success: false });
		}

		try {
			const data = form.data;

			if (data.id && operationalTime.find((b) => b.id === data.id)) {
				const updated = editOperationalTime({ ...data, id: data.id as string });
				if (!updated) throw new Error('Failed to update');
			} else {
				// Assign ID if needed
				if (!data.id) data.id = userId();
				console.log('data.id:', data.id);
				console.log(data.dateTime.time);
				const created = createOperationalTime({ ...data, id: data.id as string });
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
