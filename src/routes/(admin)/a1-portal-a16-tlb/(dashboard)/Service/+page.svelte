<script lang="ts">
	import { getServices, type Service } from '$lib/api/admin/service';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Plus, Search, Scissors, Coins } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as Pagination from '$lib/components/ui/pagination';
	import ServiceForm from './ServiceForm.svelte';

	let { data } = $props();
	let services = $state<Service[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');

	// Modal State
	let showModal = $state(false);
	let modalMode = $state<'add' | 'edit' | 'view'>('view');
	let selectedService = $state<Service | null>(null);

	// Pagination State
	let currentPage = $state(1);
	let itemsPerPage = 8;

	async function loadServices() {
		loading = true;
		const token = data.session?.access_token || '';
		const res = await getServices(fetch, token);
		if (res.success && res.data) {
			services = res.data;
		} else {
			toast.error(res.message || 'Failed to load services');
		}
		loading = false;
	}

	onMount(() => {
		loadServices();
	});

	function openModal(mode: 'add' | 'edit' | 'view', service: Service | null = null) {
		modalMode = mode;
		selectedService = service;
		showModal = true;
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	};

	// Filter and Search Logic
	let filteredServices = $derived(
		services.filter((service) => {
			return service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(service.description || '').toLowerCase().includes(searchQuery.toLowerCase());
		})
	);

	// Pagination Logic
	let totalItems = $derived(filteredServices.length);
	let totalPages = $derived(Math.ceil(totalItems / itemsPerPage));
	let paginatedServices = $derived(
		filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);
</script>

{#if showModal}
	<ServiceForm
		bind:mode={modalMode}
		service={selectedService}
		token={data.session?.access_token || ''}
		onClose={() => (showModal = false)}
		onUpdate={loadServices}
	/>
{/if}

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30 pb-20">
	<!-- Hero Header -->
	<div class="relative w-full overflow-hidden px-8 pt-8 pb-8">
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
		<div class="relative z-10 mx-auto max-w-7xl">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="h-[1px] w-12 bg-senary"></div>
					<p class="text-sm font-medium tracking-[0.3em] text-senary uppercase">Admin Portal</p>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold text-senary">{services.length}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Total Services</p>
				</div>
			</div>
			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Service <span class="text-senary">Management</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Manage your service offerings, pricing, and attainable coins. Keep your menu up to date.
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8">
		<div class="mx-auto max-w-7xl space-y-6">
			<!-- Controls -->
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-1 gap-4">
					<div class="relative max-w-md flex-1">
						<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-secondary/50" />
						<Input
							placeholder="Search services..."
							bind:value={searchQuery}
							class="h-10 rounded-xl border-white/10 bg-white/5 pl-10 text-secondary placeholder:text-secondary/50 focus:border-senary focus:ring-senary"
						/>
					</div>
				</div>

				<Button 
					onclick={() => openModal('add')}
					class="h-10 rounded-xl bg-senary px-6 font-medium text-primary hover:bg-senary/90 shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.5)] transition-all"
				>
					<Plus class="mr-2 h-4 w-4" />
					Add Service
				</Button>
			</div>

			<!-- Table -->
			<div class="rounded-3xl border border-white/5 bg-black/40 backdrop-blur-md overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead class="border-b border-white/10 bg-white/5">
							<tr>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Service Name</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Price</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Coins</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-white/5">
							{#if loading}
								{#each Array(5) as _}
									<tr>
										<td colspan="3" class="p-6">
											<div class="h-12 w-full animate-pulse rounded-lg bg-white/5"></div>
										</td>
									</tr>
								{/each}
							{:else if paginatedServices.length === 0}
								<tr>
									<td colspan="3" class="p-12 text-center text-secondary/50">
										No services found matching your criteria.
									</td>
								</tr>
							{:else}
								{#each paginatedServices as service (service.id)}
									<tr 
										class="transition-colors hover:bg-white/5 cursor-pointer"
										onclick={() => openModal('view', service)}
									>
										<td class="p-6">
											<div class="flex items-center gap-4">
												<div class="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/5">
													<div class="flex h-full w-full items-center justify-center text-secondary/30">
														<Scissors class="h-6 w-6" />
													</div>
												</div>
												<div>
													<p class="font-medium text-senary">{service.name}</p>
													<p class="text-xs text-secondary/50 line-clamp-1 max-w-[300px]">{service.description || 'No description'}</p>
												</div>
											</div>
										</td>
										<td class="p-6">
											<p class="font-medium text-secondary">{formatCurrency(service.price)}</p>
										</td>
										<td class="p-6">
											{#if (service.attainableCoin ?? 0) > 0}
												<div class="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-500 border border-yellow-500/20">
													<Coins class="h-3 w-3" />
													+{service.attainableCoin}
												</div>
											{:else}
												<span class="text-secondary/30">-</span>
											{/if}
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="flex justify-center pt-4">
					<Pagination.Root count={totalItems} perPage={itemsPerPage} bind:page={currentPage}>
						{#snippet children({ pages, currentPage })}
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary" />
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
												isActive={currentPage === page.value}
												class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary data-[active=true]:bg-senary data-[active=true]:text-primary data-[active=true]:border-senary"
											>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.NextButton class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary" />
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			{/if}
		</div>
	</div>
</div>
