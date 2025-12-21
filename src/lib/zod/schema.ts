import { z } from 'zod';

export const userId = () => String(Math.random()).slice(2);

export const barberSchema = z.object({
	id: z.string().regex(/^\d+$/),

	name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),

	phoneNumber: z
		.string()
		.trim()
		.refine((val) => /^\d+$/.test(val), {
			message: 'Phone number must be numeric only'
		})
		.refine((val) => val.length >= 10, {
			message: 'Phone number must be at least 10 digits'
		})
		.refine((val) => val.length <= 14, {
			message: 'Phone number must be at most 14 digits'
		}),

	description: z.string().trim().max(255, 'Description must be at most 255 characters').optional(),

	skills: z.string().trim().max(255, 'Skills must be at most 255 characters').optional(),

	experience: z.string().trim().max(255, 'Experience must be at most 255 characters').optional(),

	active: z.boolean().default(true)
});

export const serviceSchema = z.object({
	id: z.string().regex(/^\d+$/),

	name: z
		.string()
		.trim()
		.min(1, 'Service name is required')
		.max(50, 'Service name must be at most 50 characters'),

	price: z
		.number()
		.min(1, 'Price must be at least 1')
		.max(9999999, 'Price must be at most 7 digits'),

	description: z.string().trim().max(255, 'Description must be at most 255 characters'),

	attainableCoin: z
		.number()
		.min(0, 'Attainable coin must be at least 1')
		.max(9999999, 'Attainable coin must be at most 7 digits')
});

export const voucherSchema = z.object({
	id: z.string().optional(),

	title: z
		.string()
		.trim()
		.min(1, 'Title is required')
		.max(50, 'Title must be at most 50 characters'),

	startDate: z.object({
		date: z.string().refine((v) => v, { message: 'A date is required.' }),
		time: z.string().refine((v) => v, { message: 'A time is required.' })
	}),

	expiredDate: z.object({
		date: z.string().refine((v) => v, { message: 'A date is required.' }),
		time: z.string().refine((v) => v, { message: 'A time is required.' })
	}),

	description: z.string().trim().max(255, 'Description must be at most 255 characters'),

	service: z
		.string()
		.trim()
		.min(1, 'Service is required')
		.max(50, 'Service must be at most 50 characters'),

	value: z.number().min(1, 'Value min must be at least 1').max(100, 'Value max must be at most 100')
});

export const catalogueSchema = z.object({
	id: z.string().optional(),

	name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),

	type: z.enum(['Long', 'Short', 'Medium']),

	description: z.string().trim().max(255, 'Description must be at most 255 characters'),

	image: z.string().optional(),
	file: z.any().optional()
});

export const operationalTimeSchema = z.object({
	id: z.string().optional(),

	date: z.string().refine((v) => v, { message: 'A date is required.' }),
	hour: z.array(z.string()).refine((v) => v.length > 0, { message: 'At least one hour is required.' })
});

export const phoneSchema = z
	.string()
	.trim()
	.refine((val) => /^\d+$/.test(val), {
		message: 'Nomor telepon harus angka'
	})
	.refine((val) => val.length >= 10, {
		message: 'Nomor telepon harus minimal 10 angka'
	})
	.refine((val) => val.length <= 14, {
		message: 'Nomor telepon harus maksimal 14 angka'
	})
	.refine((val) => val.startsWith('08'), {
		message: "Nomor telepon harus dimulai dengan '08'"
	});

export const profileSchema = z.object({
	displayName: z
		.string()
		.trim()
		.min(1, 'Nama lengkap harus diisi')
		.max(30, 'Nama lengkap harus maksimal 30 karakter'),

	phone: phoneSchema
});
export const passwordSchema = z
	.string()
	.trim()
	.min(8, 'Password minimal 8 karakter')
	.regex(/[A-Z]/, 'Password harus mengandung setidaknya satu huruf besar')
	.regex(/[a-z]/, 'Password harus mengandung setidaknya satu huruf kecil')
	.regex(/[0-9]/, 'Password harus mengandung setidaknya satu angka')
	.regex(/[^A-Za-z0-9]/, 'Password harus mengandung setidaknya satu karakter khusus (contoh: @, #, $, %, ^, &, *, ?, !, dll)');

export type BarberSchema = typeof barberSchema;
export type ServiceSchema = typeof serviceSchema;
export type VoucherSchema = typeof voucherSchema;
export type CatalogueSchema = typeof catalogueSchema;
export type OperationalTimeSchema = typeof operationalTimeSchema;
export type ProfileSchema = typeof profileSchema;
export type PasswordSchema = typeof passwordSchema;
