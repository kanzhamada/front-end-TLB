<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { getCoinHistory, type CoinHistoryItem } from '$lib/api/customer/profile';
	import type { UserProfile } from '$lib/stores/auth';
	import { Coins, TrendingUp, TrendingDown, Sparkles, RefreshCw } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import * as Pagination from '$lib/components/ui/pagination';
	import { getProfile } from '$lib/api/customer/profile';
	import type { ProfileData } from '$lib/api/customer/profile';

	let profileData = $state<ProfileData | null>(null);
	// Load profile for editing
	async function loadProfile() {
		loading = true;
		error = null;
		profileData = null;

		try {
			console.debug('Getting token from authStore...');
			const token = get(authStore).session?.access_token;
			console.debug('Token:', token);
			if (!token) {
				console.debug('No token found, throwing error.');
				throw new Error('User not authenticated');
			}

			console.debug('Calling getProfile with token...');
			const response = await getProfile(token);
			console.debug('getProfile response:', response);
			if (!response.success || !response.data) {
				console.debug('Response unsuccessful or missing data, throwing error.');
				throw new Error(response.message || 'Failed to load profile');
			}

			console.debug('Setting profileData to response.data:', response.data);
			profileData = response.data;
		} catch (err) {
			console.error('Error loading profile:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading profile';
		} finally {
			console.debug('Setting loading to false.');
			loading = false;
		}
	}

	let user: UserProfile | null = get(authStore).session?.user || null;

	// State variables
	type CoinTransaction = {
		id: string;
		date: string;
		description: string;
		amount: number; // positive for earned, negative for spent
		balanceAfter: number;
		type: 'earned' | 'spent' | 'bonus' | 'redeemed';
	};

	let coinTransactions: CoinTransaction[] = $state([]);
	let activeTab = $state<'all' | 'earned' | 'spent'>('all');
	let currentPage = $state(1);
	let itemsPerPage = 10;

	let filteredTransactions = $derived(
		coinTransactions.filter((t) => {
			if (activeTab === 'all') return true;
			if (activeTab === 'earned') return t.amount < 0;
			if (activeTab === 'spent') return t.amount > -1;
			return true;
		})
	);

	let paginatedTransactions = $derived(
		filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Load user data and coin history on mount
	onMount(async () => {
		await loadCoinHistory();
	});

	async function loadCoinHistory() {
		loading = true;
		error = null;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			const response = await getCoinHistory(token);
			if (!response.success) {
				throw new Error(response.message || 'Failed to load coin history');
			}

			// Map the API response to the expected format
			coinTransactions =
				response.data?.map((item, index) => {
					const isIncome = item.type === 'income';
					return {
						id: `${index + 1}`,
						date: item.created_at,
						description: item.title || item.name,
						// Income (earned) is negative in the current UI logic (green color for < 0)
						amount: isIncome ? -(item.attainable_coin || 0) : item.price || 0,
						balanceAfter: 0,
						type: isIncome ? 'earned' : 'spent'
					};
				}) || [];

			user = get(authStore).session?.user || null;
		} catch (err) {
			console.error('Error loading coin history:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading coin history';
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		await loadProfile();
	});

	$effect(() => {
		console.log('coinTransactions:', paginatedTransactions);
	});
</script>

<svelte:head>
	<title>Profile - Coin History | Three Lights Barbershop</title>
</svelte:head>

{#if loading}
	<div class="space-y-8" in:fade>
		<!-- Header Skeleton -->
		<div class="flex items-center gap-4">
			<div class="h-12 w-12 animate-pulse rounded-xl bg-white/10"></div>
			<div class="space-y-2">
				<div class="h-8 w-48 animate-pulse rounded bg-white/10"></div>
				<div class="h-4 w-64 animate-pulse rounded bg-white/10"></div>
			</div>
		</div>

		<!-- Summary Cards Skeleton -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each [1, 2, 3] as _}
				<div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<div class="flex flex-col items-center gap-4">
						<div class="h-4 w-24 animate-pulse rounded bg-white/10"></div>
						<div class="h-10 w-32 animate-pulse rounded bg-white/10"></div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Tab Navigation Skeleton -->
		<div class="flex w-full border-b border-white/10">
			{#each [1, 2, 3] as _}
				<div class="px-6 py-3">
					<div class="h-5 w-24 animate-pulse rounded bg-white/10"></div>
				</div>
			{/each}
		</div>

		<!-- Transactions List Skeleton -->
		<div class="space-y-3">
			{#each [1, 2, 3, 4, 5] as _}
				<div
					class="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4"
				>
					<div class="flex items-center gap-4">
						<div class="h-10 w-10 animate-pulse rounded-lg bg-white/10"></div>
						<div class="space-y-2">
							<div class="h-5 w-48 animate-pulse rounded bg-white/10"></div>
							<div class="h-3 w-32 animate-pulse rounded bg-white/10"></div>
						</div>
					</div>
					<div class="flex flex-col items-end gap-1">
						<div class="h-6 w-16 animate-pulse rounded bg-white/10"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else if error}
	<div class="space-y-6">
		<div class="flex items-center gap-4">
			<div class="rounded-xl border border-white/10 bg-white/5 p-3">
				<Coins class="size-8 text-senary" />
			</div>
			<div>
				<h2 class="text-2xl font-bold text-secondary">Coin History</h2>
				<p class="text-secondary/60">Manage and track your coin activity</p>
			</div>
		</div>

		<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
			{error}
		</div>
	</div>
{:else}
	<div class="space-y-8" in:fade>
		<!-- Header -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				<div
					class="rounded-xl border border-senary/20 bg-senary/10 p-3 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
				>
					<Coins class="size-8 text-senary" />
				</div>
				<div>
					<h2 class="text-2xl font-bold text-secondary">Riwayat Koin</h2>
					<p class="text-secondary/60">Kelola dan lacak aktivitas koin Anda</p>
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

		<!-- Summary Cards -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div
				class="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-senary/30 hover:bg-white/10"
			>
				<div class="relative z-10 text-center">
					<p class="text-sm font-medium tracking-wider text-secondary/60 uppercase">
						Saldo Saat Ini
					</p>
					<p
						class="mt-2 flex items-center justify-center gap-2 text-3xl font-bold text-senary drop-shadow-lg"
					>
						<Coins class="size-6" />
						{profileData?.coin ?? 0}
					</p>
				</div>
				<div
					class="absolute -top-4 -right-4 size-24 rounded-full bg-senary/5 blur-2xl transition-all group-hover:bg-senary/10"
				></div>
			</div>

			<div
				class="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-green-500/30 hover:bg-white/10"
			>
				<div class="relative z-10 text-center">
					<p class="text-sm font-medium tracking-wider text-secondary/60 uppercase">
						Total Didapat
					</p>
					<p
						class="mt-2 flex items-center justify-center gap-2 text-3xl font-bold text-green-400 drop-shadow-lg"
					>
						<TrendingUp class="size-6" />
						+{Math.abs(
							coinTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
						)}
					</p>
				</div>
				<div
					class="absolute -top-4 -right-4 size-24 rounded-full bg-green-500/5 blur-2xl transition-all group-hover:bg-green-500/10"
				></div>
			</div>

			<div
				class="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-red-500/30 hover:bg-white/10"
			>
				<div class="relative z-10 text-center">
					<p class="text-sm font-medium tracking-wider text-secondary/60 uppercase">
						Total Dibelanjakan
					</p>
					<p
						class="mt-2 flex items-center justify-center gap-2 text-3xl font-bold text-red-400 drop-shadow-lg"
					>
						<TrendingDown class="size-6" />
						-{coinTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)}
					</p>
				</div>
				<div
					class="absolute -top-4 -right-4 size-24 rounded-full bg-red-500/5 blur-2xl transition-all group-hover:bg-red-500/10"
				></div>
			</div>
		</div>

		<!-- Tab Navigation -->
		<div class="flex w-full border-b border-white/10">
			<button
				class="relative px-6 py-3 text-sm font-medium transition-all {activeTab === 'all'
					? 'text-senary'
					: 'text-secondary/60 hover:text-secondary'}"
				onclick={() => (activeTab = 'all')}
			>
				Semua Transaksi
				{#if activeTab === 'all'}
					<div
						class="absolute bottom-0 left-0 h-0.5 w-full bg-senary shadow-[0_0_10px_rgba(212,175,55,0.5)]"
						in:fade={{ duration: 200 }}
					></div>
				{/if}
			</button>
			<button
				class="relative px-6 py-3 text-sm font-medium transition-all {activeTab === 'earned'
					? 'text-senary'
					: 'text-secondary/60 hover:text-secondary'}"
				onclick={() => (activeTab = 'earned')}
			>
				Didapat
				{#if activeTab === 'earned'}
					<div
						class="absolute bottom-0 left-0 h-0.5 w-full bg-senary shadow-[0_0_10px_rgba(212,175,55,0.5)]"
						in:fade={{ duration: 200 }}
					></div>
				{/if}
			</button>
			<button
				class="relative px-6 py-3 text-sm font-medium transition-all {activeTab === 'spent'
					? 'text-senary'
					: 'text-secondary/60 hover:text-secondary'}"
				onclick={() => (activeTab = 'spent')}
			>
				Dibelanjakan
				{#if activeTab === 'spent'}
					<div
						class="absolute bottom-0 left-0 h-0.5 w-full bg-senary shadow-[0_0_10px_rgba(212,175,55,0.5)]"
						in:fade={{ duration: 200 }}
					></div>
				{/if}
			</button>
		</div>

		<!-- Transactions List -->
		<div class="space-y-3">
			{#each paginatedTransactions as transaction (transaction.id)}
				<div
					class="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20"
					in:fly={{ y: 10, duration: 300 }}
				>
					<div class="flex items-center gap-4">
						<div
							class="rounded-lg p-2 transition-colors {transaction.amount < 0
								? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20'
								: 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20'}"
						>
							{#if transaction.amount < -1}
								<TrendingUp class="size-5" />
							{:else}
								<TrendingDown class="size-5" />
							{/if}
						</div>
						<div>
							<p class="font-medium text-secondary transition-colors group-hover:text-white">
								{transaction.description}
							</p>
							<p class="text-sm text-secondary/50">
								{(() => {
									const date = new Date(transaction.date);
									date.setHours(date.getHours());
									return date
										.toLocaleString('id-ID', {
											year: 'numeric',
											month: 'numeric',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
											timeZone: 'Asia/Jakarta'
										})
										.replace(/\//g, '-');
								})()} WIB
							</p>
						</div>
					</div>
					<div class="text-right">
						<p
							class="text-lg font-bold {transaction.amount < 0 ? 'text-green-400' : 'text-red-400'}"
						>
							{transaction.amount < 0 ? '+' : '-'}{Math.abs(transaction.amount)}
						</p>
						<!-- <p class="text-sm text-secondary/50">Balance: {transaction.balanceAfter}</p> -->
					</div>
				</div>
			{/each}

			{#if filteredTransactions.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center text-secondary/50">
					<div class="mb-4 rounded-full bg-white/5 p-4">
						<Coins class="size-8 opacity-50" />
					</div>
					<p>Tidak ada transaksi ditemukan</p>
				</div>
			{/if}
		</div>

		{#if filteredTransactions.length > itemsPerPage}
			<div class="mt-8">
				<Pagination.Root
					count={filteredTransactions.length}
					perPage={itemsPerPage}
					bind:page={currentPage}
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
	</div>
{/if}
