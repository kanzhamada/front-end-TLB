<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import {
		Eye as EyeIcon,
		Trash as TrashIcon,
		SquarePen as SquarePenIcon,
		Ellipsis as EllipsisIcon,
		Plus,
		Search as SearchIcon,
		Filter as FilterIcon,
		Sparkles
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { getCatalogues, deleteCatalogue, type Catalogue } from '$lib/api/admin/catalogue';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import CatalogueForm from './CatalogueForm.svelte';
	import { fade, fly, scale } from 'svelte/transition';

	import { cn } from '$lib/utils';

	let { data } = $props();
	let catalogues = $state<Catalogue[]>([]);
	let searchQuery = $state('');
	let selectedType = $state<string>('All');
	
	// Modal State
	let isModalOpen = $state(false);
	let modalMode = $state<'add' | 'edit' | 'view'>('add');
	let selectedCatalogue = $state<Catalogue | null>(null);

	// Active State for Mobile/Click interaction
	let activeStates = $state<Record<string, boolean>>({});

	function toggleActive(id: string) {
		activeStates[id] = !activeStates[id];
	}

	async function loadCatalogues() {
		const token = data.session?.access_token || '';
		const res = await getCatalogues(fetch, token);
		if (res.success && res.data) {
			catalogues = res.data;
		} else {
			toast.error(res.message || 'Failed to load catalogues');
		}
	}

	onMount(() => {
		loadCatalogues();
	});

	const filteredCatalogues = $derived(
		catalogues.filter((c) => {
			const searchLower = searchQuery.toLowerCase();
			const matchesSearch = 
				c.name.toLowerCase().includes(searchLower) || 
				c.description.toLowerCase().includes(searchLower);
			const matchesType = selectedType === 'All' || c.type.toLowerCase() === selectedType.toLowerCase();
			return matchesSearch && matchesType;
		})
	);

	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 8; // Matched customer side (approx)

	const totalPages = $derived(Math.ceil(filteredCatalogues.length / itemsPerPage));
	
	const paginatedCatalogues = $derived(
		filteredCatalogues.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		)
	);

	// Reset to page 1 when filter changes
	$effect(() => {
		// Just accessing filteredCatalogues to trigger dependency
		filteredCatalogues; 
		currentPage = 1;
	});

	const handleDelete = async (id: string) => {
		if (confirm('Are you sure you want to delete this catalogue?')) {
			const token = data.session?.access_token || '';
			const success = await deleteCatalogue(fetch, id, token);
			if (success.success) {
				catalogues = catalogues.filter((c) => c.id !== id);
				toast.success('Catalogue deleted successfully');
			} else {
				toast.error(success.message || 'Failed to delete catalogue');
			}
		}
	};

	function openModal(mode: 'add' | 'edit' | 'view', catalogue: Catalogue | null = null) {
		modalMode = mode;
		selectedCatalogue = catalogue;
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		selectedCatalogue = null;
	}

	const serviceOptions = [
		{ value: 'All', label: 'All Categories' },
		{ value: 'short', label: 'Short' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'long', label: 'Long' }
	];
</script>

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30">
	<!-- Custom Header to match Customer Aesthetic -->
	<div class="relative w-full overflow-hidden px-8 pt-8 pb-8">
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
		
		<div class="relative z-10 mx-auto max-w-7xl">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="h-[1px] w-12 bg-senary"></div>
					<p class="text-sm font-medium tracking-[0.3em] text-senary uppercase">Admin Portal</p>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold text-senary">{catalogues.length}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Total Catalogue</p>
				</div>
			</div>

			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Catalogue <span class="text-senary">Gallery</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Manage your curated collection of premium hairstyles. Add, edit, or remove styles to keep your portfolio fresh.
					</p>
				</div>

				<div class="flex flex-col gap-4 md:items-end">
					<div class="flex flex-wrap items-center gap-3">
						<!-- Filter -->
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary"
									>
										<FilterIcon class="mr-2 h-4 w-4" />
										{selectedType === 'All' ? 'All Categories' : selectedType}
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="border-white/10 bg-slate-900 text-secondary">
								{#each serviceOptions as option}
									<DropdownMenu.Item
										onclick={() => (selectedType = option.value)}
										class="focus:bg-white/10 focus:text-senary"
									>
										{option.label}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>

						<!-- Add Button -->
						<Button
							onclick={() => openModal('add')}
							class="bg-senary text-primary hover:bg-senary/90 font-bold tracking-wide"
						>
							<Plus class="mr-2 h-4 w-4" />
							ADD NEW
						</Button>
					</div>

					<!-- Search -->
					<div class="relative w-full md:w-72">
						<SearchIcon
							class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-secondary/50"
						/>
						<Input
							placeholder="Search catalogue..."
							bind:value={searchQuery}
							class="w-full rounded-xl border-white/10 bg-white/5 py-6 pr-4 pl-11 text-secondary placeholder:text-secondary/50 focus:border-senary/50 focus:ring-senary/20"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8 pb-20">
		<div class="mx-auto max-w-7xl">
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each paginatedCatalogues as catalogue, i (catalogue.id || i)}
					{@const isActive = activeStates[catalogue.id] || false}
					<div
						in:scale={{ duration: 600, delay: i * 50, start: 0.9 }}
						class={cn(
							"group relative overflow-hidden rounded-xl border border-white/5 bg-black/40 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-senary/30 hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.1)]",
							isActive && "border-senary/30 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.1)] -translate-y-2"
						)}
						onclick={() => toggleActive(catalogue.id)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') toggleActive(catalogue.id);
						}}
					>
						<div class="relative aspect-[3/4] overflow-hidden">
							<img
								src={`${catalogue.image}?width=400&resize=cover&format=webp`}
								alt={catalogue.name}
								class="h-full w-full object-cover transition duration-1000 group-hover:scale-110 group-hover:grayscale-100"
								loading="lazy"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-[#0A1F18] via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"
							></div>

							<!-- Hover Overlay Actions -->
							<div
								class={cn(
									"absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-[2px] transition-all duration-500",
									isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
								)}
							>
								<button
									onclick={(e) => {
										e.stopPropagation();
										openModal('view', catalogue);
									}}
									class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-2.5 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md transition hover:bg-white hover:text-black"
								>
									<EyeIcon class="h-3 w-3" />
									VIEW
								</button>
								<button
									onclick={(e) => {
										e.stopPropagation();
										openModal('edit', catalogue);
									}}
									class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-senary py-2.5 text-[10px] font-bold tracking-widest text-primary uppercase shadow-lg transition hover:bg-white hover:text-black"
								>
									<SquarePenIcon class="h-3 w-3" />
									EDIT
								</button>
								<button
									onclick={(e) => {
										e.stopPropagation();
										handleDelete(catalogue.id);
									}}
									class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 py-2.5 text-[10px] font-bold tracking-widest text-red-400 uppercase backdrop-blur-md transition hover:bg-red-500 hover:text-white"
								>
									<TrashIcon class="h-3 w-3" />
									DELETE
								</button>
							</div>

							<!-- Labels -->
							<div
								class="absolute top-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[9px] font-bold tracking-wider text-white uppercase backdrop-blur-md"
							>
								{catalogue.type}
							</div>

							<div
								class={cn(
									"absolute bottom-0 left-0 w-full p-5 transition-transform duration-500",
									isActive 
										? "translate-y-4 opacity-0" 
										: "translate-y-0 opacity-100 group-hover:translate-y-4 group-hover:opacity-0"
								)}
							>
								<h4 class="truncate font-serif text-lg text-white">{catalogue.name}</h4>
								<p class="mt-1 line-clamp-2 text-xs font-light text-secondary/70">
									{catalogue.description}
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination Controls -->
			{#if totalPages > 1}
				<div class="mt-12 flex items-center justify-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onclick={() => currentPage = Math.max(1, currentPage - 1)}
						disabled={currentPage === 1}
						class="text-secondary/70 hover:bg-white/10 hover:text-secondary disabled:opacity-30"
					>
						Previous
					</Button>
					
					<div class="flex items-center gap-1">
						{#each Array(totalPages) as _, i}
							<button
								class={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
									currentPage === i + 1
										? 'bg-senary text-primary'
										: 'text-secondary hover:bg-white/10'
								}`}
								onclick={() => currentPage = i + 1}
							>
								{i + 1}
							</button>
						{/each}
					</div>

					<Button
						variant="ghost"
						size="sm"
						onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
						disabled={currentPage === totalPages}
						class="text-secondary/70 hover:bg-white/10 hover:text-secondary disabled:opacity-30"
					>
						Next
					</Button>
				</div>
			{/if}
		</div>
	</div>

	{#if isModalOpen}
		<CatalogueForm
			mode={modalMode}
			catalogue={selectedCatalogue}
			token={data.session?.access_token || ''}
			onClose={closeModal}
			onUpdate={loadCatalogues}
		/>
	{/if}
</div>
