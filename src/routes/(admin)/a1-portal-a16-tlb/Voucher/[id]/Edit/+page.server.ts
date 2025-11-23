import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { voucherSchema, userId } from '$lib/zod/schema.js';
import { createVoucher, editVoucher, getVoucher } from '$lib/api/admin/voucher.js';

const crudSchema = voucherSchema.extend({
	id: voucherSchema.shape.id.optional()
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(voucherSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		console.log('formData:', Object.fromEntries(formData));
		const form = await superValidate(formData, zod(voucherSchema));
		console.log('form:', form);

		const response = getVoucher();
		const voucher = response.vouchers;

		// let error = false;

		if (!form.valid) {
			return fail(400, { form, message: 'Gagal menyimpan data', success: false });
		}

		try {
			const data = form.data;

			if (data.id && voucher.find((b) => b.id === data.id)) {
				const updated = editVoucher({ ...data, id: data.id as string });
				if (!updated) throw new Error('Failed to update');
			} else {
				// Assign ID if needed
				if (!data.id) data.id = userId();
				const created = createVoucher({ ...data, id: data.id as string });
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
