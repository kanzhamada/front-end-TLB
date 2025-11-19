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
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Separator } from '$lib/components/ui/separator';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { getCoinHistory, type CoinHistoryItem } from '$lib/api/customer/profile';
	import type { UserProfile } from '$lib/stores/auth';
	import { Coins, TrendingUp, TrendingDown } from 'lucide-svelte';

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
	let user: UserProfile | null = $state(null);
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
		<Card>
			<CardHeader class="bg-[#2e6057]/5 p-6">
				<div class="flex items-center gap-4">
					<div class="rounded-lg bg-[#2e6057]/10 p-3">
						<Coins class="size-8 text-[#2e6057]" />
					</div>
					<div>
						<CardTitle class="text-2xl">Riwayat Koin</CardTitle>
						<CardDescription>Kelola dan pantau aktivitas koin Anda</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent class="p-6 pt-0">
				<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
					{#each [1, 2, 3] as _}
						<Card class="border border-[#e5e7eb] bg-[#f9fafb]">
							<CardContent class="p-4 text-center">
								<div class="mx-auto mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
								<div class="mx-auto h-8 w-1/2 animate-pulse rounded bg-gray-200"></div>
							</CardContent>
						</Card>
					{/each}
				</div>

				<Separator class="my-6" />

				<div class="animate-pulse space-y-4">
					{#each [1, 2, 3, 4] as _}
						<div class="h-16 w-full rounded bg-gray-200"></div>
					{/each}
				</div>
			</CardContent>
		</Card>
	</div>
{:else if error}
	<div class="space-y-6">
		<Card>
			<CardHeader class="bg-[#2e6057]/5 p-6">
				<div class="flex items-center gap-4">
					<div class="rounded-lg bg-[#2e6057]/10 p-3">
						<Coins class="size-8 text-[#2e6057]" />
					</div>
					<div>
						<CardTitle class="text-2xl">Riwayat Koin</CardTitle>
						<CardDescription>Kelola dan pantau aktivitas koin Anda</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent class="p-6 pt-0">
				<div class="rounded-lg bg-red-50 p-4 text-red-500">
					{error}
				</div>
			</CardContent>
		</Card>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Mini Navigation for Profile Sections - Now handled in layout -->

		<!-- User Coin Summary Card -->
		<Card>
			<CardHeader class="bg-[#2e6057]/5 p-6">
				<div class="flex items-center gap-4">
					<div class="rounded-lg bg-[#2e6057]/10 p-3">
						<Coins class="size-8 text-[#2e6057]" />
					</div>
					<div>
						<CardTitle class="text-2xl">Riwayat Koin</CardTitle>
						<CardDescription>Kelola dan pantau aktivitas koin Anda</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent class="p-6 pt-0">
				<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Card class="border border-[#e5e7eb] bg-[#f9fafb]">
						<CardContent class="p-4 text-center">
							<p class="text-sm text-[#6b7280]">Total Koin Saat Ini</p>
							<p class="flex items-center justify-center gap-1 text-2xl font-bold text-[#2e6057]">
								<Coins class="size-5" />
								{get(authStore).session?.user?.coins || 0}
							</p>
						</CardContent>
					</Card>
					<Card class="border border-[#e5e7eb] bg-[#f9fafb]">
						<CardContent class="p-4 text-center">
							<p class="text-sm text-[#6b7280]">Koin Diperoleh Bulan Ini</p>
							<p class="flex items-center justify-center gap-1 text-2xl font-bold text-[#10b981]">
								<TrendingUp class="size-5" />
								+{coinTransactions
									.filter((t) => t.amount > 0)
									.reduce((sum, t) => sum + t.amount, 0)}
							</p>
						</CardContent>
					</Card>
					<Card class="border border-[#e5e7eb] bg-[#f9fafb]">
						<CardContent class="p-4 text-center">
							<p class="text-sm text-[#6b7280]">Koin Digunakan Bulan Ini</p>
							<p class="flex items-center justify-center gap-1 text-2xl font-bold text-[#ef4444]">
								<TrendingDown class="size-5" />
								-{Math.abs(
									coinTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
								)}
							</p>
						</CardContent>
					</Card>
				</div>

				<Separator class="my-6" />

				<!-- Tab Navigation -->
				<div class="mb-6 grid w-full grid-cols-3">
					<button
						class="border-b pb-2 text-sm font-medium {activeTab === 'all'
							? 'border-[#2e6057] text-[#2e6057]'
							: 'border-transparent text-[#6b7280] hover:border-[#2e6057] hover:text-[#2e6057]'}"
						onclick={() => (activeTab = 'all')}
					>
						Semua
					</button>
					<button
						class="border-b pb-2 text-sm font-medium {activeTab === 'earned'
							? 'border-[#2e6057] text-[#2e6057]'
							: 'border-transparent text-[#6b7280] hover:border-[#2e6057] hover:text-[#2e6057]'}"
						onclick={() => (activeTab = 'earned')}
					>
						Diperoleh
					</button>
					<button
						class="border-b pb-2 text-sm font-medium {activeTab === 'spent'
							? 'border-[#2e6057] text-[#2e6057]'
							: 'border-transparent text-[#6b7280] hover:border-[#2e6057] hover:text-[#2e6057]'}"
						onclick={() => (activeTab = 'spent')}
					>
						Digunakan
					</button>
				</div>

				{#if activeTab === 'all'}
					<div class="space-y-3">
						{#each coinTransactions as transaction (transaction.id)}
							<div class="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50">
								<div class="flex items-center gap-4">
									<div class="rounded-lg bg-[#2e6057]/10 p-2">
										{#if transaction.type === 'earned' || transaction.type === 'bonus'}
											<TrendingUp class="size-5 text-[#10b981]" />
										{:else}
											<TrendingDown class="size-5 text-[#ef4444]" />
										{/if}
									</div>
									<div>
										<p class="font-medium">{transaction.description}</p>
										<p class="text-sm text-gray-500">
											{new Date(transaction.date).toLocaleString()}
										</p>
									</div>
								</div>
								<div class="text-right">
									<p
										class={transaction.amount > 0
											? 'font-medium text-[#10b981]'
											: 'font-medium text-[#ef4444]'}
									>
										{transaction.amount > 0 ? '+' : ''}{transaction.amount}
									</p>
									<p class="text-sm text-gray-500">Sisa: {transaction.balanceAfter}</p>
								</div>
							</div>
						{/each}
					</div>
				{:else if activeTab === 'earned'}
					<div class="space-y-3">
						{#each coinTransactions as transaction (transaction.id)}
							{#if transaction.type === 'earned' || transaction.type === 'bonus'}
								<div
									class="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
								>
									<div class="flex items-center gap-4">
										<div class="rounded-lg bg-[#2e6057]/10 p-2">
											<TrendingUp class="size-5 text-[#10b981]" />
										</div>
										<div>
											<p class="font-medium">{transaction.description}</p>
											<p class="text-sm text-gray-500">
												{new Date(transaction.date).toLocaleString()}
											</p>
										</div>
									</div>
									<div class="text-right">
										<p class="font-medium text-[#10b981]">+{transaction.amount}</p>
										<p class="text-sm text-gray-500">Sisa: {transaction.balanceAfter}</p>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{:else if activeTab === 'spent'}
					<div class="space-y-3">
						{#each coinTransactions as transaction (transaction.id)}
							{#if transaction.type === 'spent' || transaction.type === 'redeemed'}
								<div
									class="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
								>
									<div class="flex items-center gap-4">
										<div class="rounded-lg bg-[#2e6057]/10 p-2">
											<TrendingDown class="size-5 text-[#ef4444]" />
										</div>
										<div>
											<p class="font-medium">{transaction.description}</p>
											<p class="text-sm text-gray-500">
												{new Date(transaction.date).toLocaleString()}
											</p>
										</div>
									</div>
									<div class="text-right">
										<p class="font-medium text-[#ef4444]">-{Math.abs(transaction.amount)}</p>
										<p class="text-sm text-gray-500">Sisa: {transaction.balanceAfter}</p>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
{/if}
