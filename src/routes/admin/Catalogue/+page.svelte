<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		FilterIcon,
		Plus,
		SearchIcon
	} from '@lucide/svelte/icons';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { MediaQuery } from 'svelte/reactivity';
	import { createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import {
		type ColumnFiltersState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel
	} from '@tanstack/table-core';
	import { getCatalogue } from '$lib/api/admin/catalogue';
	import { catalogueColumns } from '$lib/columns/admin/catalogueColumns';

	let response = getCatalogue();

	let catalogues = response.catalogues;
	let tablePagination = $state({ pageIndex: 0, pageSize: 9 });
	let tableColumnFilters = $state<ColumnFiltersState>([]);

	let selectedFilterValue = $state<string>('');

	const dataCatalogue = createSvelteTable({
		get data() {
			return catalogues;
		},
		columns: catalogueColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			tablePagination = typeof updater === 'function' ? updater(tablePagination) : updater;
		},
		onColumnFiltersChange: (updater) => {
			tableColumnFilters = typeof updater === 'function' ? updater(tableColumnFilters) : updater;
		},
		state: {
			get pagination() {
				return tablePagination;
			},
			get columnFilters() {
				return tableColumnFilters;
			}
		}
	});

	const serviceOptions = [
		{
			value: '',
			label: 'All Categories'
		},
		{
			value: 'Short',
			label: 'Short'
		},
		{
			value: 'Medium',
			label: 'Medium'
		},
		{
			value: 'Long',
			label: 'Long'
		}
	];

	const isDesktopView = new MediaQuery('(min-width: 768px)');

	const itemsPerPage = $derived(isDesktopView.current ? 9 : 9);

	const siblingCount = $derived(isDesktopView.current ? 1 : 0);

	const visibleRowCount = $derived(dataCatalogue.getFilteredRowModel().rows.length);
	let currentPageIndex = $derived(dataCatalogue.getState().pagination.pageIndex + 1);
</script>

<!-- Grid Catalogue -->

<!-- Grid Catalogue -->
<div class="px-6 py-6">
	<div class="mx-auto max-w-7xl">
		<div class="rounded-xl">
			<div class=" mb-4 flex flex-col gap-4 sm:flex-row">
				<!-- Search bar -->

				<div class="relative max-w-md flex-1">
					<SearchIcon
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
					/>
					<Input
						placeholder={`Search by Catalogue...`}
						value={(dataCatalogue.getColumn('name')?.getFilterValue() as string) ?? ''}
						oninput={(e) => {
							dataCatalogue.getColumn('name')?.setFilterValue(e.currentTarget.value);
							dataCatalogue.setPageIndex(0);
						}}
						class="border-gray-200/60 pl-10 focus:border-gray-300 focus:ring-0 focus:ring-offset-0"
					/>
				</div>

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
									? serviceOptions.find((opt) => opt.value === selectedFilterValue)?.label
									: 'All Categories'}
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="w-48">
						{#each serviceOptions as option}
							<DropdownMenu.Item
								onclick={() => {
									selectedFilterValue = option.value;
									dataCatalogue.getColumn('type')?.setFilterValue(option.value || undefined);
								}}
							>
								{option.label}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<!-- Add New button -->

				<Button href={`/admin/Catalogue/Create`} class="ml-auto">
					Add New Catalogue
					<Plus />
				</Button>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each dataCatalogue.getRowModel().rows as row (row.id)}
					{@const catalogue = row.original}
					<a href="/admin/Catalogue/{catalogue.id}">
						<Card.Root
							class="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#2e605775] bg-white/90 shadow-2xl shadow-gray-900/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2"
						>
							<Card.Header class="relative p-0">
								<div class="relative w-full overflow-hidden">
									<AspectRatio ratio={18 / 9} class="bg-gradient-to-br from-gray-100 to-gray-200">
										<img
											src={catalogue.image}
											alt={catalogue.name}
											class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
										/>
										<div
											class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
										></div>
									</AspectRatio>
								</div>
							</Card.Header>

							<div class="flex flex-grow flex-col p-5 pb-3">
								<Card.Title
									class="mb-3 text-2xl font-normal tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-[#2E6057]"
								>
									{catalogue.name}
								</Card.Title>
								<Card.Description
									class="line-clamp-3 overflow-hidden text-sm leading-relaxed text-gray-600"
								>
									{catalogue.description}
								</Card.Description>
							</div>

							<Card.Footer class="border-t border-gray-100 bg-gray-50/50 px-8 py-6">
								<div class="flex w-full items-center justify-between align-middle">
									<span
										class="inline-flex items-center rounded-full border border-[#2E6057] bg-[#BBC6C4] px-3 py-1 text-xs font-medium text-[#2E6057]"
									>
										{catalogue.type}
									</span>

									<DropdownMenu.Root>
										<DropdownMenu.Trigger><EllipsisIcon /></DropdownMenu.Trigger>
										<DropdownMenu.Content>
											<DropdownMenu.Group>
												<DropdownMenu.Label class="px-2 py-1.5 text-xs font-medium text-gray-500">
													Actions
												</DropdownMenu.Label>
												<DropdownMenu.Separator />
												<a href="/admin/Catalogue/{catalogue.id}">
													<DropdownMenu.Item class="m-0 cursor-pointer">
														<EyeIcon class="mr-2 h-4 w-4" /> View Details</DropdownMenu.Item
													>
												</a>
												<a href="/admin/Catalogue/{catalogue.id}/Edit">
													<DropdownMenu.Item class="m-0 cursor-pointer"
														><SquarePenIcon class="mr-2 h-4 w-4" />Edit Catalogue</DropdownMenu.Item
													>
												</a>

												<AlertDialog.Root>
													<AlertDialog.Trigger>
														{#snippet child({ props })}
															<DropdownMenu.Item
																{...props}
																class="m-0 cursor-pointer"
																onSelect={(e) => e.preventDefault()}
															>
																<TrashIcon class="mr-2 h-4 w-4" />Delete
															</DropdownMenu.Item>
														{/snippet}
													</AlertDialog.Trigger>
													<AlertDialog.Portal>
														<AlertDialog.Overlay />
														<AlertDialog.Content>
															<AlertDialog.Header>
																<AlertDialog.Title>Are you sure?</AlertDialog.Title>
																<AlertDialog.Description class="text-black-800 ">
																	<p class="font-medium">
																		Catalogue: {catalogue.name}
																	</p>

																	{catalogue.description}
																</AlertDialog.Description>
															</AlertDialog.Header>
															<AlertDialog.Footer>
																<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
																<AlertDialog.Action style="background-color: #fa003f;">
																	Delete</AlertDialog.Action
																>
															</AlertDialog.Footer>
														</AlertDialog.Content>
													</AlertDialog.Portal>
												</AlertDialog.Root>
											</DropdownMenu.Group>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							</Card.Footer>
						</Card.Root>
					</a>
				{/each}
			</div>

			<!-- Footer with Statistics and Pagination -->
			<div
				class="flex flex-shrink-0 flex-col items-center justify-between space-y-4 p-6 sm:flex-row sm:justify-end sm:space-y-0"
			>
				<div class="text-sm text-gray-500">
					Showing {dataCatalogue.getRowModel().rows.length} of {visibleRowCount}
					catalogues
					{#if visibleRowCount !== catalogues.length}
						<span class="text-xs text-gray-400">(filtered from {catalogues.length} total)</span>
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
									disabled={!dataCatalogue.getCanPreviousPage()}
									onclick={() => dataCatalogue.previousPage()}
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
												dataCatalogue.setPageIndex(page.value - 1);
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
									disabled={!dataCatalogue.getCanNextPage()}
									onclick={() => {
										dataCatalogue.nextPage();
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
		</div>
	</div>
</div>
