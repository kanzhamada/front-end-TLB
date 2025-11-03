import type { Voucher } from '$lib/types/adminTypes';
import { faker } from '@faker-js/faker';
import { userId } from '../../zod/schema';

const services = ['Premium Haircut', 'Classic Haircut', 'Shave Bread'] as const;

const vouchers: Voucher[] = Array.from({ length: 69 }, () => ({
	id: userId(),
	title: faker.word.verb(),
	startDate: new Date(
		2025,
		Math.floor(Math.random() * 12),
		Math.floor(Math.random() * 28) + 1,
		Math.floor(Math.random() * 24),
		Math.floor(Math.random() * 60)
	)
		.toISOString()
		.slice(0, 16)
		.replace('T', ' '),
	expiredDate: new Date(
		2025,
		Math.floor(Math.random() * 12),
		Math.floor(Math.random() * 28) + 1,
		Math.floor(Math.random() * 24),
		Math.floor(Math.random() * 60)
	)
		.toISOString()
		.slice(0, 16)
		.replace('T', ' '),
	description: faker.lorem.paragraph(),
	service: services[Math.floor(Math.random() * services.length)],
	value: Math.floor(Math.random() * 100)
}));

interface VoucherResponse {
	success: boolean;
	data?: Voucher;
	error?: string;
}

export const getVoucherById = (id: string): VoucherResponse => {
	try {
		const voucher = vouchers.find((b) => b.id === id);

		if (!voucher) {
			return {
				success: false,
				error: 'Voucher not found'
			};
		}

		const cleanVoucher: Voucher = {
			id: voucher.id,
			title: voucher.title,
			startDate: voucher.startDate,
			expiredDate: voucher.expiredDate,
			description: voucher.description,
			service: voucher.service,
			value: voucher.value
		};

		return {
			success: true,
			data: cleanVoucher
		};
	} catch (error) {
		return {
			success: false,
			error: 'Failed to fetch voucher' + error
		};
	}
};

export const getVoucher = () => {
	return {
		vouchers
	};
};

export const editVoucher = (updatedVoucher: Voucher): boolean => {
	const index = vouchers.findIndex((b) => b.id === updatedVoucher.id);
	if (index !== -1) {
		vouchers[index] = updatedVoucher;
		return true;
	}
	return false; // not found
};

export const createVoucher = (newVoucher: Voucher): boolean => {
	try {
		vouchers.push(newVoucher); // actually add the new Service to the array
		return true;
	} catch (e) {
		console.error('Failed to create Voucher:', e);
		return false;
	}
};
