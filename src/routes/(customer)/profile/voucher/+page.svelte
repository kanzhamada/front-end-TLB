<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import {
		getOwnedVouchers,
		getAvailableVouchers,
		buyVoucher,
		getProfile,
		type Voucher
	} from '$lib/api/customer/profile';
	import { getServices, type Service } from '$lib/api/shared/api';
	import { Button } from '$lib/components/ui/button';
	import {
		Ticket,
		Calendar,
		Wallet,
		Clock,
		Sparkles,
		ShoppingBag,
		Coins,
		Layers,
		RefreshCw
	} from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import * as Pagination from '$lib/components/ui/pagination';
	import VoucherBuySheet from '$lib/components/User/Voucher/VoucherBuySheet.svelte';
	import { toast } from 'svelte-sonner';

	// Extended type for grouped vouchers
	type GroupedVoucher = Voucher & { count: number; serviceName?: string };

	// State variables
	let ownedVouchers: Voucher[] = $state([]);
	let availableVouchers: Voucher[] = $state([]);
	let servicesMap: Record<string, string> = $state({});
	let userCoins = $state(0);

	let selectedVoucher: Voucher | null = $state(null);

	// Pagination for Owned Vouchers
	let ownedPage = $state(1);
	let ownedItemsPerPage = 10;

	// Pagination for Available Vouchers
	let availablePage = $state(1);
	let availableItemsPerPage = 12;

	let loading = $state(true);
	let error = $state<string | null>(null);

	// Derived grouped vouchers
	let groupedOwnedVouchers = $derived(groupVouchers(ownedVouchers));
	let groupedAvailableVouchers = $derived(groupVouchers(availableVouchers));

	$effect(() => {
		console.log('availableVouchers 333', availableVouchers);
	});

	// Derived paginated lists
	let paginatedOwnedVouchers = $derived(
		groupedOwnedVouchers.slice((ownedPage - 1) * ownedItemsPerPage, ownedPage * ownedItemsPerPage)
	);

	let paginatedAvailableVouchers = $derived(
		groupedAvailableVouchers.slice(
			(availablePage - 1) * availableItemsPerPage,
			availablePage * availableItemsPerPage
		)
	);

	function groupVouchers(vouchers: Voucher[]): GroupedVoucher[] {
		const groups = new Map<string, GroupedVoucher>();

		for (const voucher of vouchers) {
			const existing = groups.get(voucher.voucherID);
			if (existing) {
				existing.count++;
			} else {
				groups.set(voucher.voucherID, {
					...voucher,
					count: 1,
					serviceName: servicesMap[voucher.serviceID] || (voucher as any).serviceName
				});
			}
		}

		return Array.from(groups.values());
	}

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		

		loading = true;
		error = null;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			// Fetch everything in parallel
			const [ownedResponse, availableResponse, servicesResponse, profileResponse] =
				await Promise.all([
					getOwnedVouchers(token),
					getAvailableVouchers(token),
					getServices(fetch),
					getProfile(token)
				]);

			if (!ownedResponse.success || !ownedResponse.data) {
				throw new Error(ownedResponse.message || 'Failed to load owned vouchers');
			}

			// Handle services
			if (servicesResponse.success && servicesResponse.data) {
				servicesMap = servicesResponse.data.reduce(
					(acc, service) => {
						acc[service.id] = service.name;
						return acc;
					},
					{} as Record<string, string>
				);
			}

			// Handle profile for coins
			if (profileResponse.success && profileResponse.data) {
				userCoins = profileResponse.data.coin;
				// Update store as well if needed, but local state is enough for now
			} else {
				// Fallback to store if fetch fails
				userCoins = get(authStore).session?.user.coin || 0;
			}

			if (!availableResponse.success || !availableResponse.data) {
				console.error('Failed to load available vouchers:', availableResponse.message);
			}

			ownedVouchers = ownedResponse.data;
			availableVouchers = availableResponse.data || [];
		} catch (err) {
			console.error('Error loading data:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading data';
		} finally {
			loading = false;
		}
	}

	let buySheetOpen = $state(false);

	async function handleBuyVoucher(voucher: Voucher) {
		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				toast.error('You must be logged in to buy vouchers');
				return;
			}

			const response = await buyVoucher(voucher.voucherID, token);

			if (response.success) {
				toast.success('Voucher purchased successfully!');
				selectedVoucher = null;
				await window.location.reload();
			} else {
				toast.error(response.error || response.message || 'Failed to purchase voucher');
			}

			buySheetOpen = false;
			
		} catch (err) {
			console.error('Error buying voucher:', err);
			toast.error('An error occurred while purchasing the voucher');
		}
	}

	// Helper function to format date
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Profile - Voucher | Three Lights Barbershop</title>
</svelte:head>

{#if loading}
	<div class="space-y-10" in:fade>
		<!-- Owned Vouchers Skeleton -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="h-12 w-12 animate-pulse rounded-lg bg-white/10"></div>
				<div class="space-y-2">
					<div class="h-6 w-32 animate-pulse rounded bg-white/10"></div>
					<div class="h-4 w-24 animate-pulse rounded bg-white/10"></div>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{#each [1, 2] as _}
					<div
						class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
					>
						<div class="flex items-start justify-between gap-4">
							<div class="w-full space-y-3">
								<div class="h-6 w-3/4 animate-pulse rounded bg-white/10"></div>
								<div class="h-4 w-1/2 animate-pulse rounded bg-white/10"></div>
								<div class="mt-2 space-y-2">
									<div class="h-3 w-full animate-pulse rounded bg-white/10"></div>
									<div class="h-3 w-5/6 animate-pulse rounded bg-white/10"></div>
								</div>
							</div>
							<div class="flex flex-col items-end gap-2">
								<div class="h-8 w-20 animate-pulse rounded-lg bg-white/10"></div>
							</div>
						</div>
						<div class="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
							<div class="h-4 w-32 animate-pulse rounded bg-white/10"></div>
							<div class="h-4 w-24 animate-pulse rounded bg-white/10"></div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Available Vouchers Skeleton -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="h-10 w-10 animate-pulse rounded-lg bg-white/10"></div>
				<div class="h-6 w-40 animate-pulse rounded bg-white/10"></div>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-3">
				{#each [1, 2, 3] as _}
					<div
						class="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
					>
						<div class="flex w-full items-start justify-between gap-4">
							<div class="w-full space-y-3">
								<div class="h-6 w-3/4 animate-pulse rounded bg-white/10"></div>
								<div class="h-4 w-1/2 animate-pulse rounded bg-white/10"></div>
								<div class="mt-2 space-y-2">
									<div class="h-3 w-full animate-pulse rounded bg-white/10"></div>
									<div class="h-3 w-5/6 animate-pulse rounded bg-white/10"></div>
								</div>
							</div>
							<div class="h-8 w-16 animate-pulse rounded-lg bg-white/10"></div>
						</div>
						<div class="mt-4 flex w-full items-center justify-between border-t border-white/5 pt-4">
							<div class="h-4 w-24 animate-pulse rounded bg-white/10"></div>
							<div class="h-4 w-16 animate-pulse rounded bg-white/10"></div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
{:else if error}
	<div class="space-y-6">
		<div class="flex items-center gap-4">
			<div class="rounded-xl border border-white/10 bg-white/5 p-3">
				<Ticket class="size-8 text-senary" />
			</div>
			<div>
				<h2 class="text-2xl font-bold text-secondary">Voucher</h2>
				<p class="text-secondary/60">Kelola voucher yang Anda miliki</p>
			</div>
		</div>

		<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
			{error}
		</div>
	</div>
{:else}
	<div class="space-y-10" in:fade>
		<!-- Header with Refresh -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				<div class="rounded-xl border border-white/10 bg-white/5 p-3">
					<Ticket class="size-8 text-senary" />
				</div>
				<div>
					<h2 class="text-2xl font-bold text-secondary">Voucher</h2>
					<p class="text-secondary/60">Kelola voucher yang Anda miliki</p>
				</div>
			</div>
			<div class="flex flex-col items-end gap-2">
				<Button
					variant="outline"
					size="sm"
					class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-white"
					onclick={() => window.location.reload()}
					disabled={loading}
				>
					<RefreshCw class="mr-2 size-4 {loading ? 'animate-spin' : ''}" />
					Refresh
				</Button>
				<p class="text-xs text-secondary/40">
					Klik refresh jika data belum diperbarui
				</p>
			</div>
		</div>

		<!-- Owned Vouchers Section -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-senary/10 p-2">
					<Ticket class="size-8 text-senary" />
				</div>
				<h3 class="text-xl font-bold text-secondary">Voucher Saya</h3>
				<span class="rounded-full bg-white/10 px-2 py-0.5 text-xs text-secondary/60"
					>{ownedVouchers.length} Total</span
				>
			</div>

			{#if groupedOwnedVouchers.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm"
				>
					<div class="mb-4 rounded-full bg-white/5 p-4 shadow-inner">
						<Ticket class="size-8 text-secondary/40" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-secondary">Tidak ada voucher yang dimiliki</h3>
					<p class="text-sm text-secondary/50">Anda tidak memiliki voucher aktif saat ini.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{#each paginatedOwnedVouchers as voucher}
						<div
							class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-senary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20"
							in:fly={{ y: 20, duration: 400 }}
						>
							<div
								class="absolute -top-10 -right-10 size-32 rounded-full bg-senary/5 blur-3xl transition-all group-hover:bg-senary/10"
							></div>

							<div class="relative z-10 flex h-full flex-col justify-between gap-4">
								<div class="flex items-start justify-between gap-4">
									<div>
										<h4
											class="text-lg font-bold text-secondary transition-colors group-hover:text-senary"
										>
											{voucher.title}
										</h4>
										<p class="text-xs font-medium text-senary/80">
											{voucher.serviceName ?? 'Semua Layanan'}
										</p>

										<p class="mt-1 text-sm text-secondary/60">{voucher.description}</p>
									</div>
									<div class="flex flex-col items-end gap-2">
										<div
											class="shrink-0 rounded-lg border border-senary/20 bg-senary/10 px-3 py-1 text-sm font-bold text-senary backdrop-blur-md"
										>
											{#if voucher.value}
												Diskon {new Intl.NumberFormat('id-ID', {
													style: 'currency',
													currency: 'IDR'
												})
													.format(voucher.value)
													.replace('Rp', '')
													.replace(',00', '')}
											{:else if voucher.price}
												{voucher.price}%
											{:else}
												PENAWARAN
											{/if}
										</div>
										{#if voucher.count > 1}
											<div
												class="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-secondary/80"
											>
												<Layers class="size-3" />
												<span>x{voucher.count}</span>
											</div>
										{/if}
									</div>
								</div>

								<div class="mt-2 space-y-2 border-t border-white/5 pt-4">
									<div class="flex items-center gap-2 text-sm text-secondary/50">
										<Calendar class="size-4 text-senary/50" />
										<span
											>Berlaku sampai: {(() => {
												const date = new Date(voucher.expireDate);
												date.setHours(date.getHours());
												return date
													.toLocaleString('id-ID', {
														year: 'numeric',
														month: 'numeric',
														day: 'numeric',
														timeZone: 'Asia/Jakarta'
													})
													.replace(/\//g, '-');
											})()}</span
										>
									</div>
									{#if voucher.buy_date}
										<div class="flex items-center gap-2 text-sm text-secondary/50">
											<Clock class="size-4 text-senary/50" />
											<span
												>Dibeli: {(() => {
													const date = new Date(voucher.buy_date);
													date.setHours(date.getHours());
													return date
														.toLocaleString('id-ID', {
															year: 'numeric',
															month: 'numeric',
															day: 'numeric',
															timeZone: 'Asia/Jakarta'
														})
														.replace(/\//g, '-');
												})()}</span
											>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if groupedOwnedVouchers.length > ownedItemsPerPage}
				<div class="mt-8">
					<Pagination.Root
						count={groupedOwnedVouchers.length}
						perPage={ownedItemsPerPage}
						bind:page={ownedPage}
					>
						{#snippet children({ pages, currentPage })}
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton />
								</Pagination.Item>
								{#each pages as page (page.key)}
									{#if page.type === 'ellipsis'}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link {page} isActive={currentPage === page.value}>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.NextButton />
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			{/if}
		</section>

		<!-- Available Vouchers Section -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-senary/10 p-2">
					<ShoppingBag class="size-5 text-senary" />
				</div>
				<h3 class="text-xl font-bold text-secondary">Voucher Tersedia</h3>
			</div>

			{#if groupedAvailableVouchers.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm"
				>
					<div class="mb-4 rounded-full bg-white/5 p-4 shadow-inner">
						<Ticket class="size-8 text-secondary/40" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-secondary">Tidak ada voucher tersedia</h3>
					<p class="text-sm text-secondary/50">Cek kembali nanti untuk penawaran baru!</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-3">
					{#each paginatedAvailableVouchers as voucher (voucher.voucherID)}
						<button
							class="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm transition-all hover:border-senary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20"
							in:fly={{ y: 20, duration: 400 }}
							onclick={() => {
								selectedVoucher = voucher;
								buySheetOpen = true;
							}}
						>
							<div
								class="absolute -top-10 -right-10 size-32 rounded-full bg-senary/5 blur-3xl transition-all group-hover:bg-senary/10"
							></div>

							<div class="relative z-10 flex h-full w-full flex-col justify-between gap-4">
								<div class="flex w-full items-start justify-between gap-4">
									<div>
										<h4
											class="text-lg font-bold text-secondary transition-colors group-hover:text-senary"
										>
											{voucher.title}
										</h4>

										<p class="text-xs font-medium text-senary/80">
											{voucher.serviceName ?? 'All Services'}
										</p>

										<p class="mt-1 line-clamp-2 text-sm text-secondary/60">{voucher.description}</p>
									</div>
									<div class="flex flex-col items-end gap-2">
										<div
											class="shrink-0 rounded-lg border border-senary/20 bg-senary/10 px-3 py-1 text-sm font-bold text-senary backdrop-blur-md"
										>
											{#if voucher.value}
												Diskon {new Intl.NumberFormat('id-ID', {
													style: 'currency',
													currency: 'IDR'
												})
													.format(voucher.value)
													.replace('Rp', '')
													.replace(',00', '')}
											{:else if voucher.price}
												{voucher.price}%
											{:else}
												PENAWARAN
											{/if}
										</div>
										{#if voucher.count > 1}
											<div
												class="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-secondary/80"
											>
												<Layers class="size-3" />
												<span>x{voucher.count}</span>
											</div>
										{/if}
									</div>
								</div>

								<div
									class="mt-2 flex w-full items-center justify-between border-t border-white/5 pt-4"
								>
									<div class="flex items-center gap-2 text-sm text-secondary/50">
										<Calendar class="size-4 text-senary/50" />
										<span
											>Berlaku Sampai: {(() => {
												const date = new Date(voucher.expireDate);
												date.setHours(date.getHours());
												return date
													.toLocaleString('id-ID', {
														year: 'numeric',
														month: 'numeric',
														day: 'numeric',
														timeZone: 'Asia/Jakarta'
													})
													.replace(/\//g, '-');
											})()}</span
										>
									</div>
									<div class="flex items-center gap-1 font-bold text-senary">
										<Coins class="h-3 w-3" />
										{voucher.price}
									</div>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}

			{#if groupedAvailableVouchers.length > availableItemsPerPage}
				<div class="mt-8">
					<Pagination.Root
						count={groupedAvailableVouchers.length}
						perPage={availableItemsPerPage}
						bind:page={availablePage}
					>
						{#snippet children({ pages, currentPage })}
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton />
								</Pagination.Item>
								{#each pages as page (page.key)}
									{#if page.type === 'ellipsis'}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link {page} isActive={currentPage === page.value}>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.NextButton />
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			{/if}
		</section>
	</div>

	<!-- Voucher Buy Sheet -->
	<VoucherBuySheet
		bind:open={buySheetOpen}
		bind:voucher={selectedVoucher}
		{userCoins}
		onClose={() => {
			selectedVoucher = null;
			buySheetOpen = false;
		}}
		onBuy={handleBuyVoucher}
	/>
{/if}
