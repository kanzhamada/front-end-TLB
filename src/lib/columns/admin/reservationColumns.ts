import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index';
import { renderComponent } from '$lib/components/ui/data-table/index';
import SortableHeaderButton from '$lib/components/Admin/Table/SortableHeaderButton.svelte';
import DataTableActionReservation from '$lib/components/Admin/Table/DataTableActionReservation.svelte';
import type { Reservation } from '$lib/types/adminTypes';

export const reservationColumns: ColumnDef<Reservation>[] = [
	{
		accessorKey: 'customer',
		header: 'Customer',
		cell: ({ row }) => {
			const customer = row.getValue('customer') as string;
			const customerSnippet = createRawSnippet<[string]>((getCustomer) => {
				const name = getCustomer();
				return {
					render: () => `
						<div class="font-medium text-gray-900">${name}</div>
					`
				};
			});
			return renderSnippet(customerSnippet, customer);
		}
	},
	{
		accessorKey: 'invoice',
		header: 'Invoice',
		cell: ({ row }) => {
			const invoice = row.getValue('invoice') as string;
			const invoiceSnippet = createRawSnippet<[string]>((getInvoice) => {
				const inv = getInvoice();
				return {
					render: () => `
						<div class="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
							${inv}
						</div>
					`
				};
			});
			return renderSnippet(invoiceSnippet, invoice);
		}
	},
	{
		accessorKey: 'dateTime',
		header: ({ column }) =>
			renderComponent(SortableHeaderButton, {
				label: 'Date Time',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			const dateTimeRaw = row.getValue('dateTime');
			const dateTime = new Date(dateTimeRaw as string | number | Date);

			// Format tanggal dan jam
			const date = dateTime.toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			});
			const time = dateTime
				.toLocaleTimeString('id-ID', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				})
				.replace('.', ':');

			// Snippet HTML-nya
			const dateTimeCellSnippet = createRawSnippet<[string[]]>((getDateTime) => {
				const [dateText, timeText] = getDateTime();
				return {
					render: () =>
						`<div class="space-y-1">
							<div class="font-medium text-gray-900 text-sm">${dateText}</div>
							<div class="text-small text-gray-500 ">${timeText}</div>
						</div>`
				};
			});

			return renderSnippet(dateTimeCellSnippet, [date, time]);
		}
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.getValue('status') as Reservation['status'];

			let className = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ';
			let statusText = '';

			switch (status) {
				case 'waiting-approve':
					className += 'bg-yellow-50 text-yellow-700 border border-yellow-200';
					statusText = 'Waiting Approve';
					break;
				case 'on-going':
					className += 'bg-blue-50 text-blue-700 border border-blue-200';
					statusText = 'On Going';
					break;
				case 'completed':
					className += 'bg-green-50 text-green-700 border border-green-200';
					statusText = 'Completed';
					break;
				case 'canceled-by-user':
					className += 'bg-red-50 text-red-700 border border-red-200';
					statusText = 'Canceled by User';
					break;
				case 'canceled-by-admin':
					className += 'bg-purple-50 text-purple-700 border border-purple-200';
					statusText = 'Canceled by Admin';
					break;
				default:
					className += 'bg-gray-50 text-gray-700 border border-gray-200';
					statusText = status;
					break;
			}

			const statusSnippet = createRawSnippet(() => ({
				render: () => `<span class="${className}">${statusText}</span>`
			}));

			return renderSnippet(statusSnippet);
		}
	},
	{
		accessorKey: 'amount',
		header: () => {
			const amountHeaderSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-right font-medium">Amount</div>`
			}));
			return renderSnippet(amountHeaderSnippet, '');
		},
		cell: ({ row }) => {
			const formatter = new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});

			const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
				const amount = getAmount();
				return {
					render: () => `<div class="text-right">
						<div class="font-semibold text-gray-900">${amount}</div>
					</div>`
				};
			});

			return renderSnippet(amountCellSnippet, formatter.format(parseFloat(row.getValue('amount'))));
		}
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActionReservation, {
				data: row.original
			});
		}
	}
];
