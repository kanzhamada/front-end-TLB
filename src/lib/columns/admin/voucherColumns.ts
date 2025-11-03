import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableAction from '$lib/components/Admin/Table/DataTableAction.svelte';
import SortableHeaderButton from '$lib/components/Admin/Table/SortableHeaderButton.svelte';
import EyeIcon from '@lucide/svelte/icons/eye';
import TrashIcon from '@lucide/svelte/icons/trash';
import SquarePenIcon from '@lucide/svelte/icons/square-pen';
import type { Voucher } from '$lib/types/adminTypes';

export const voucherColumns: ColumnDef<Voucher>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) =>
			renderComponent(SortableHeaderButton, {
				label: 'Title',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			const title = row.getValue('title') as string;
			const titleSnippet = createRawSnippet<[string]>((getTitle) => {
				const name = getTitle();
				return {
					render: () => `
								<div class="font-medium text-gray-900 capitalize">${name}</div>
							`
				};
			});
			return renderSnippet(titleSnippet, title);
		}
	},
	{
		accessorKey: 'expiredDate',
		header: ({ column }) =>
			renderComponent(SortableHeaderButton, {
				label: 'Expired Date',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			const expiredDateRaw = row.getValue('expiredDate');
			const expiredDate = new Date(expiredDateRaw as string | number | Date);

			// Format tanggal dan jam
			const date = expiredDate.toLocaleDateString('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			});
			const time = expiredDate
				.toLocaleTimeString('id-ID', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				})
				.replace('.', ':');

			// Snippet HTML-nya
			const expiredDateCellSnippet = createRawSnippet<[string[]]>((getExpiredDate) => {
				const [dateText, timeText] = getExpiredDate();
				return {
					render: () =>
						`<div class="space-y-1">
							<div class="font-medium text-gray-900 text-sm">${dateText}</div>
							<div class="text-small text-gray-500 ">${timeText}</div>
						</div>`
				};
			});

			return renderSnippet(expiredDateCellSnippet, [date, time]);
		}
	},
	{
		accessorKey: 'service',
		header: 'Service',
		cell: ({ row }) => {
			const service = row.getValue('service') as string;
			const serviceSnippet = createRawSnippet<[string]>((getService) => {
				const serve = getService();
				return {
					render:
						() => `<div class="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
					${serve}
					</div>`
				};
			});
			return renderSnippet(serviceSnippet, service);
		}
	},
	{
		accessorKey: 'value',
		header: ({ column }) =>
			renderComponent(SortableHeaderButton, {
				label: 'Value',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			const valueRaw = row.getValue('value') as string;

			const valueCellSnippet = createRawSnippet<[string]>((getValue) => {
				const val = getValue();
				return {
					render: () => `<div>${val}%</div>`
				};
			});
			return renderSnippet(valueCellSnippet, valueRaw);
		}
	},
	{
		id: 'actions',
		header: 'Action',
		cell: ({ row }) => {
			return renderComponent(DataTableAction, {
				data: row.original,
				href: [
					{
						url: `/admin/Voucher/${row.original.id}`,
						itemText: 'View Details',
						icon: EyeIcon
					},
					{
						url: `/admin/Voucher/${row.original.id}/Edit`,
						itemText: 'Edit Voucher',
						icon: SquarePenIcon
					}
				],
				alertDialog: [
					{
						title: 'Are you absolutely sure?',
						description: `This action cannot be undone. This will permanently delete the voucher's information from the system.`,
						descriptionHighlight: `Voucher Title: ${row.original.title}`,
						itemText: 'Delete Voucher',
						icon: TrashIcon,
						buttonText: 'Delete',
						buttonColor: '#fa003f'
					}
				]
			});
		}
	}
];
