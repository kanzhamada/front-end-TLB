import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderSnippet } from '$lib/components/ui/data-table/index';
import { renderComponent } from '$lib/components/ui/data-table/index';
import SortableHeaderButton from '$lib/components/Admin/Table/SortableHeaderButton.svelte';
import DataTableAction from '$lib/components/Admin/Table/DataTableAction.svelte';
import { Eye as EyeIcon, Trash as TrashIcon, SquarePen as SquarePenIcon } from 'lucide-svelte';
import type { Service } from '$lib/types/adminTypes';

export const serviceColumns: ColumnDef<Service>[] = [
	{
		accessorKey: 'serviceName',
		header: ({ column }) =>
			renderComponent(SortableHeaderButton, {
				label: 'Service Name',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'price',
		header: ({ column }) =>
			renderComponent(SortableHeaderButton, {
				label: 'Price',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			const formatter = new Intl.NumberFormat('id-ID', {
				style: 'currency',
				currency: 'IDR',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});

			const priceCellSnippet = createRawSnippet<[string]>((getPrice) => {
				const price = getPrice();
				return {
					render: () => `<div>
						<div class="font-semibold text-gray-900">${price}</div>
					</div>`
				};
			});

			return renderSnippet(priceCellSnippet, formatter.format(parseFloat(row.getValue('price'))));
		}
	},
	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => {
			const descriptionCellSnippet = createRawSnippet<[string]>((getDescription) => {
				const description = getDescription();
				const newDescription =
					description.length > 100 ? description.slice(0, 97) + '...' : description;
				return {
					render: () => `<div class="text-ellipsis">${newDescription}</div>`
				};
			});

			return renderSnippet(descriptionCellSnippet, row.getValue('description'));
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
						url: `/a1-portal-a16-tlb/Service/${row.original.id}`,
						itemText: 'View Details',
						icon: EyeIcon
					},
					{
						url: `/a1-portal-a16-tlb/Service/${row.original.id}/Edit`,
						itemText: 'Edit Service',
						icon: SquarePenIcon
					}
				],
				alertDialog: [
					{
						title: 'Are you absolutely sure?',
						description: `This action cannot be undone. This will permanently delete the service's information from the system.`,
						descriptionHighlight: `Service Name: ${row.original.serviceName}`,
						itemText: 'Delete Service',
						icon: TrashIcon,
						buttonText: 'Delete',
						buttonColor: '#fa003f'
					}
				]
			});
		}
	},
	{
		id: 'combined',
		accessorFn: (row) => `${row.serviceName} ${row.description}`,
		header: () => null, // will not render anything
		cell: () => null, // will not render anything
		enableSorting: false,
		enableColumnFilter: true,
		filterFn: (row, columnId, filterValue) => {
			return row.getValue<string>(columnId)?.toLowerCase().includes(filterValue.toLowerCase());
		}
	}
];
