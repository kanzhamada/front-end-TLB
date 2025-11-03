<!--
 * A versatile and reusable DataTable component built with TypeScript and Svelte,
 * leveraging TanStack Table for robust table functionality. This component supports
 * dynamic data display, sorting, filtering, pagination, and responsive design.
 *
 * Features:
 * - **Dynamic Data & Columns**: Accepts generic `TData` and `TValue` for flexible
 *   data and column definitions, ensuring type safety.
 * - **Search & Filtering**: Configurable search bar and dropdown filters for
 *   intuitive data exploration.
 * - **Pagination**: Responsive pagination with dynamic page sizes and sibling
 *   counts based on viewport size.
 * - **Add New Entity**: Optional button for creating new entities with a
 *   customizable entity name.
 * - **Responsive Design**: Adapts to desktop and mobile views using media queries.
 * - **UI Components**: Integrates seamlessly with custom UI components (Button,
 *   Input, DropdownMenu, Table, Pagination) for a cohesive look and feel.
 *
 * The component is highly customizable through props like `searchConfig`,
 * `filterConfig`, and `enableAddNew`, making it adaptable to various use cases.
 * It uses Svelte's reactivity system for efficient state management and rendering.
 -->

<script lang="ts" generics="TData, TValue">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { MediaQuery } from 'svelte/reactivity';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type SortingState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		FilterIcon,
		Plus,
		SearchIcon
	} from '@lucide/svelte/icons';
	import { setContext } from 'svelte';
	import { onMount } from 'svelte';

	type DataTableProps<TData, TValue> = {
		tableData: TData[];
		tableColumns: ColumnDef<TData, TValue>[];
	};

	// Props for DataTable component
	let {
		tableData,
		tableColumns,
		entityName,
		searchConfig,
		filterConfig,
		enableAddNew
	}: {
		tableData: TData[];
		tableColumns: ColumnDef<TData, TValue>[];
		entityName: string;
		searchConfig?: { enabled: boolean; column: string; placeholder: string };
		filterConfig?: {
			enabled: boolean;
			options: { value: string; label: string; className?: string; color?: string }[];
			defaultColumn: string;
		};
		enableAddNew?: boolean;
	} & DataTableProps<TData, TValue> = $props();

	let searchInputPlaceholder = $state<string>('');
	let filterColumnName = $state<string>('');
	let searchColumnName = $state<string>('');
	let selectedFilterValue = $state<string>('');
	let defaultFilterLabel = $state<string>('');
	let filterOptions = $state<
		{ value: string; label: string; className?: string; color?: string }[]
	>([]);

	onMount(() => {
		if (filterConfig) {
			filterOptions = filterConfig.options;
			filterColumnName = filterConfig.defaultColumn;
			defaultFilterLabel = filterConfig.options[0].label;
		} else {
			filterOptions = [];
		}
		if (searchConfig) {
			searchInputPlaceholder = searchConfig.placeholder;
			searchColumnName = searchConfig.column;
		}
	});

	let tablePagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let tableSorting = $state<SortingState>([]);
	let tableColumnFilters = $state<ColumnFiltersState>([]);

	const dataTable = createSvelteTable({
		get data() {
			return tableData;
		},
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: true,
		onPaginationChange: (updater) => {
			tablePagination = typeof updater === 'function' ? updater(tablePagination) : updater;
		},
		onSortingChange: (updater) => {
			tableSorting = typeof updater === 'function' ? updater(tableSorting) : updater;
		},
		onColumnFiltersChange: (updater) => {
			tableColumnFilters = typeof updater === 'function' ? updater(tableColumnFilters) : updater;
		},
		state: {
			get pagination() {
				return tablePagination;
			},
			get sorting() {
				return tableSorting;
			},
			get columnFilters() {
				return tableColumnFilters;
			}
		}
	});

	const isDesktopView = new MediaQuery('(min-width: 768px)');

	const itemsPerPage = $derived(isDesktopView.current ? 10 : 10);
	const siblingCount = $derived(isDesktopView.current ? 1 : 0);

	const capitalizeFirstLetter = (s: string) => s[0].toUpperCase() + s.slice(1);

	let visibleRowCount = $derived(dataTable.getFilteredRowModel().rows.length);

	let currentPageIndex = $derived(dataTable.getState().pagination.pageIndex + 1);
</script>

<div class="flex-shrink-0 border-b border-gray-100 p-6">
	<div class="mb-4 flex flex-col gap-4 sm:flex-row">
		<!-- Search bar -->
		{#if searchConfig?.enabled}
			<div class="relative max-w-md flex-1">
				<SearchIcon
					class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
				/>
				<Input
					placeholder={`Search by ${searchInputPlaceholder}...`}
					value={(dataTable.getColumn(searchColumnName)?.getFilterValue() as string) ?? ''}
					oninput={(e) => {
						dataTable.getColumn(searchColumnName)?.setFilterValue(e.currentTarget.value);
						dataTable.setPageIndex(0);
					}}
					class="border-gray-200/60 pl-10 focus:border-gray-300 focus:ring-0 focus:ring-offset-0"
				/>
			</div>
		{/if}

		<!-- Filter dropdown -->
		{#if filterConfig?.enabled}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							class="border-gray-200/60 text-gray-600 hover:bg-gray-50"
						>
							<FilterIcon class="mr-2 h-4 w-4" />
							{selectedFilterValue
								? filterOptions.find((opt) => opt.value === selectedFilterValue)?.label
								: defaultFilterLabel}
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start" class="w-48">
					{#each filterOptions as option}
						<DropdownMenu.Item
							onclick={() => {
								selectedFilterValue = option.value;
								dataTable.getColumn(filterColumnName)?.setFilterValue(option.value || undefined);
							}}
							class={option.className || ''}
							style={option.color || ''}
						>
							{option.label}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}

		<!-- Add New button -->
		{#if enableAddNew}
			<Button href={`/admin/${capitalizeFirstLetter(entityName)}/Create`} class="ml-auto">
				Add New {capitalizeFirstLetter(entityName)}
				<Plus />
			</Button>
		{/if}
	</div>

	<!-- Table and other UI elements remain unchanged, except for variable names -->
	<!-- Example for table -->
	<div class="overflow-hidden rounded-lg border border-gray-200/60">
		<Table.Root class="bg-white">
			<Table.Header class="bg-gray-50/50">
				{#each dataTable.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head
								class="border-b border-gray-200/60 px-6 py-4 text-sm font-medium text-gray-600"
							>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each dataTable.getRowModel().rows as row (row.id)}
					<Table.Row
						data-state={row.getIsSelected() && 'selected'}
						class="border-b border-gray-100 transition-colors hover:bg-gray-50/30"
					>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell class="px-6 py-4 text-gray-900">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={tableColumns.length} class="h-32 text-center text-gray-500">
							<div class="flex flex-col items-center justify-center space-y-2">
								<div class="text-gray-400">No {entityName} found</div>
								<div class="text-sm text-gray-400">
									Try adjusting your search or filter criteria
								</div>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<!-- Footer with Statistics and Pagination -->
<div
	class="flex flex-shrink-0 flex-col items-center justify-between space-y-4 border-t border-gray-100 bg-gray-50/30 p-6 sm:flex-row sm:justify-end sm:space-y-0"
>
	<div class="text-sm text-gray-500">
		Showing {dataTable.getRowModel().rows.length} of {visibleRowCount}
		{entityName}s
		{#if visibleRowCount !== tableData.length}
			<span class="text-xs text-gray-400">(filtered from {tableData.length} total)</span>
		{/if}
	</div>

	<Pagination.Root
		count={visibleRowCount}
		perPage={itemsPerPage}
		{siblingCount}
		page={currentPageIndex}
		class="mx-auto flex w-full justify-end"
	>
		{#snippet children({ pages })}
			<Pagination.Content>
				<Pagination.Item>
					<Button
						disabled={!dataTable.getCanPreviousPage()}
						onclick={() => dataTable.previousPage()}
					>
						<ChevronLeftIcon class="size-4" />
						<span class="hidden sm:block">Previous</span>
					</Button>
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link
								{page}
								isActive={currentPageIndex === page.value}
								onclick={() => {
									console.log('Current Page Index:', currentPageIndex, 'Page Value:', page.value);
									dataTable.setPageIndex(page.value - 1);
								}}
								class={currentPageIndex === page.value
									? 'border-[#2E6057] bg-[#2E6057] text-white'
									: 'border-gray-200/60 text-gray-600 hover:bg-gray-50'}
							>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Button
						disabled={!dataTable.getCanNextPage()}
						onclick={() => {
							console.log(
								'Current Page Index:',
								currentPageIndex,
								'Page Value:',
								dataTable.getPageCount()
							);
							dataTable.nextPage();
						}}
					>
						<span class="hidden sm:block">Next</span>
						<ChevronRightIcon class="size-4" />
					</Button>
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>
</div>
