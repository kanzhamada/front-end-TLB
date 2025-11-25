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
	import { Coins, TrendingUp, TrendingDown, Sparkles } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

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
				response.data?.map((item, index) => ({
					id: `${index + 1}`,
					date: item.created_at,
					description: item.title || item.name,
					amount: item.price || 0,
					balanceAfter: 0, // The API doesn't provide balance after, we could calculate it if needed
					type: item.price > 0 ? 'earned' : 'spent'
				})) || [];

			user = get(authStore).session?.user || null;
		} catch (err) {
			console.error('Error loading coin history:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading coin history';
		} finally {
			loading = false;
		}
	}
</script>

{#if loading}
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

		<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each [1, 2, 3] as _}
				<div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<div class="mx-auto mb-2 h-4 w-3/4 animate-pulse rounded bg-white/10"></div>
					<div class="mx-auto h-8 w-1/2 animate-pulse rounded bg-white/10"></div>
				</div>
			{/each}
		</div>

		<div class="animate-pulse space-y-4">
			{#each [1, 2, 3, 4] as _}
				<div class="h-20 w-full rounded-xl border border-white/10 bg-white/5"></div>
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
		<div class="flex items-center gap-4">
			<div
				class="rounded-xl border border-senary/20 bg-senary/10 p-3 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
			>
				<Coins class="size-8 text-senary" />
			</div>
			<div>
				<h2 class="text-2xl font-bold text-secondary">Coin History</h2>
				<p class="text-secondary/60">Manage and track your coin activity</p>
			</div>
		</div>

		<!-- Summary Cards -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div
				class="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-senary/30 hover:bg-white/10"
			>
				<div class="relative z-10 text-center">
					<p class="text-sm font-medium tracking-wider text-secondary/60 uppercase">
						Current Balance
					</p>
					<p
						class="mt-2 flex items-center justify-center gap-2 text-3xl font-bold text-senary drop-shadow-lg"
					>
						<Coins class="size-6" />
						{user?.coins ?? 0}
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
						Earned This Month
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
						Spent This Month
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
				All Transactions
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
				Earned
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
				Spent
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
			{#each coinTransactions.filter((t) => {
				if (activeTab === 'all') return true;
				if (activeTab === 'earned') return t.amount < 0;
				if (activeTab === 'spent') return t.amount > 0;
				return true;
			}) as transaction (transaction.id)}
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
							{#if transaction.amount > 0}
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
								{new Date(transaction.date).toLocaleString()}
							</p>
						</div>
					</div>
					<div class="text-right">
						<p
							class="text-lg font-bold {transaction.amount < 0 ? 'text-green-400' : 'text-red-400'}"
						>
							{transaction.amount < 0 ? '+' : '-'}{transaction.amount}
						</p>
						<!-- <p class="text-sm text-secondary/50">Balance: {transaction.balanceAfter}</p> -->
					</div>
				</div>
			{/each}

			{#if coinTransactions.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center text-secondary/50">
					<div class="mb-4 rounded-full bg-white/5 p-4">
						<Coins class="size-8 opacity-50" />
					</div>
					<p>No transactions found</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
