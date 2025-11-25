<script lang="ts">
	import { Search, ChevronsDown, Sparkles } from 'lucide-svelte';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte/icons';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getCatalogue } from '$lib/api/shared/catalogue';
	import CustomCursor from '$lib/components/ui/CustomCursor.svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		type ColumnFiltersState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel
	} from '@tanstack/table-core';
	import { catalogueColumns } from '$lib/columns/admin/catalogueColumns';
	import { createSvelteTable } from '$lib/components/ui/data-table/index.js';
	import CatalogueCard from '$lib/components/ui/CatalogueCard.svelte';
	import ServiceDetailModal from '$lib/components/ui/ServiceDetailModal.svelte';
	import FilterGroup from '$lib/components/ui/FilterGroup.svelte';

	let response = getCatalogue();
	let catalogues = response.catalogues;

	let tablePagination = $state({ pageIndex: 0, pageSize: 8 });
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
			label: 'All'
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

	// Fixed: Added isDesktopView reactive variable
	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const isDesktopView = $derived({ current: windowWidth >= 768 });

	// Update window width on resize
	if (typeof window !== 'undefined') {
		window.addEventListener('resize', () => {
			windowWidth = window.innerWidth;
		});
	}

	const itemsPerPage = $derived(isDesktopView.current ? 8 : 8);
	const siblingCount = $derived(isDesktopView.current ? 1 : 0);
	const visibleRowCount = $derived(dataCatalogue.getFilteredRowModel().rows.length);
	let currentPageIndex = $derived(dataCatalogue.getState().pagination.pageIndex + 1);

	// State using Svelte 5 runes
	let selectedFilter = $state('All');
	// Fixed: Proper type for selectedService
	let selectedService = $state<(typeof catalogues)[0] | null>(null);
</script>

<div class="relative min-h-screen overflow-hidden text-secondary selection:bg-senary/30">
	<!-- Hero Section -->
	<section class="relative h-[60vh] w-full overflow-hidden">
		<div
			class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/90"
		>
			<img
				src="https://images.unsplash.com/photo-1608869776252-33ff061fabf2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
				alt=""
				class="h-full w-full object-cover opacity-25"
			/>
		</div>

		<div
			class="relative z-10 mx-auto flex h-full max-w-7xl flex-col content-center justify-center px-6"
			in:fade={{ duration: 1000 }}
		>
			<div class="mb-4 flex items-center gap-4" in:fly={{ y: 20, duration: 800, delay: 200 }}>
				<div class="h-[1px] w-12 bg-senary"></div>
				<p class="text-lg font-medium tracking-[0.3em] text-senary uppercase">The Collection</p>
			</div>

			<h1
				class="max-w-4xl text-left text-6xl leading-[0.9] font-bold tracking-tighter text-secondary drop-shadow-2xl md:text-8xl lg:text-[100px]"
				in:fly={{ y: 30, duration: 800, delay: 400 }}
			>
				Curated <br />
				<span class="text-gradient-gold">Excellence</span>
			</h1>

			<div
				class="z-20 mt-12 w-full transform rounded-2xl md:w-full"
				in:fly={{ y: 40, duration: 800, delay: 600 }}
			>
				<div class="flex flex-wrap gap-6">
					<a href="/catalogue/ai" class="group relative">
						<div
							class="absolute -inset-1 rounded-lg bg-gradient-to-r from-senary to-quaternary opacity-75 blur transition duration-200 group-hover:opacity-100"
						></div>
						<button
							class="relative flex items-center gap-3 rounded-lg bg-[#F5F5DC] px-8 py-4 font-bold text-[#1B4D3E] ring-1 ring-white/10 transition hover:bg-white"
						>
							<Sparkles class="h-5 w-5 text-senary" />
							<span>AI Catalogue</span>
						</button>
					</a>
					<button
						on:click={() => {
							const servicesElement = document.getElementById('services');
							if (servicesElement) {
								const stickyHeaderHeight = 60;
								const elementRect = servicesElement.getBoundingClientRect();
								const targetScrollPosition = window.scrollY + elementRect.top - stickyHeaderHeight;
								window.scrollTo({
									top: targetScrollPosition,
									behavior: 'smooth'
								});
							}
						}}
						class="group flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-8 py-4 font-bold text-secondary backdrop-blur-sm transition hover:border-senary/50 hover:bg-white/10"
					>
						<ChevronsDown class="h-5 w-5 text-secondary/70 transition group-hover:text-secondary" />
						<span>Browse Catalogue</span>
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Services Catalog -->
	<section class="relative z-10 container mx-auto px-4 py-20" id="services">
		<div class="mb-12">
			<div class="mb-4 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h3 class="mb-2 font-serif text-4xl font-bold text-secondary">Catalogue</h3>
					<p class="font-light text-secondary/70">Explore our premium services and styles</p>
				</div>

				<div class="flex w-full flex-col gap-4 md:w-auto md:items-end">
					<div class="flex flex-wrap items-center gap-3">
						<FilterGroup
							options={serviceOptions}
							{selectedFilter}
							onSelect={(value) => {
								selectedFilter = value || 'All';
								selectedFilterValue = value;
								dataCatalogue.getColumn('type')?.setFilterValue(value || undefined);
							}}
						/>
					</div>

					<div class="relative w-full md:w-72">
						<Search
							class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-secondary/50"
						/>
						<Input
							placeholder="Search catalogue..."
							value={(dataCatalogue.getColumn('name')?.getFilterValue() as string) ?? ''}
							oninput={(e) => {
								dataCatalogue.getColumn('name')?.setFilterValue(e.currentTarget.value);
								dataCatalogue.setPageIndex(0);
							}}
							class="w-full rounded-xl border-white/10 bg-white/5 py-6 pr-4 pl-11 text-secondary  placeholder:text-secondary/50 focus:border-senary/50 focus:ring-senary/20"
						/>
					</div>
				</div>
			</div>

			<!-- Service Grid -->
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each dataCatalogue.getRowModel().rows as row, i (row.id)}
					{@const catalogue = row.original}
					<CatalogueCard
						{catalogue}
						index={i}
						onSelect={(c) => (selectedService = c)}
						onBook={(c) => console.log('Book', c)}
					/>
				{/each}
			</div>

			<Pagination.Root
				count={visibleRowCount}
				perPage={itemsPerPage}
				{siblingCount}
				page={currentPageIndex}
				class="mx-auto mt-12 flex w-full justify-center"
			>
				{#snippet children({ pages })}
					<Pagination.Content>
						<Pagination.Item>
							<Button
								disabled={!dataCatalogue.getCanPreviousPage()}
								onclick={() => dataCatalogue.previousPage()}
								variant="ghost"
								class="text-secondary/70 hover:bg-white/10 hover:text-secondary"
							>
								<ChevronLeftIcon class="size-4" />
								<span class="hidden sm:block">Previous</span>
							</Button>
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis class="text-secondary/50" />
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
											? 'border-senary bg-senary text-primary hover:bg-senary/80'
											: 'border-transparent bg-transparent text-secondary/70 hover:bg-white/10 hover:text-secondary'}
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
								variant="ghost"
								class="text-secondary/70 hover:bg-white/10 hover:text-secondary"
							>
								<span class="hidden sm:block">Next</span>
								<ChevronRightIcon class="size-4" />
							</Button>
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	</section>
</div>

<!-- Detail Modal -->
<ServiceDetailModal bind:selectedService onClose={() => (selectedService = null)} />
