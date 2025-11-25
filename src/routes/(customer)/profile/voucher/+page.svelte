<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { getOwnedVouchers, type Voucher } from '$lib/api/customer/profile';
	import { Button } from '$lib/components/ui/button';
	import { Ticket, Calendar, Wallet, Clock, Sparkles } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	// State variables
	let ownedVouchers: Voucher[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		await loadVouchers();
	});

	async function loadVouchers() {
		loading = true;
		error = null;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			const response = await getOwnedVouchers(token);
			if (!response.success || !response.data) {
				throw new Error(response.message || 'Failed to load vouchers');
			}

			ownedVouchers = response.data;
		} catch (err) {
			console.error('Error loading vouchers:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading vouchers';
		} finally {
			loading = false;
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

{#if loading}
	<div class="space-y-8">
		<div class="flex items-center gap-4">
			<div class="rounded-xl border border-white/10 bg-white/5 p-3">
				<Ticket class="size-8 text-senary" />
			</div>
			<div>
				<h2 class="text-2xl font-bold text-secondary">My Vouchers</h2>
				<p class="text-secondary/60">Manage your available vouchers</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each [1, 2, 3, 4] as _}
				<div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<div class="flex items-center justify-between">
						<div class="w-full space-y-3">
							<div class="h-6 w-3/4 animate-pulse rounded bg-white/10"></div>
							<div class="h-4 w-full animate-pulse rounded bg-white/10"></div>
						</div>
					</div>
					<div class="mt-4 flex items-center gap-2">
						<div class="h-4 w-4 animate-pulse rounded bg-white/10"></div>
						<div class="h-4 w-1/2 animate-pulse rounded bg-white/10"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else if error}
	<div class="space-y-6">
		<div class="flex items-center gap-4">
			<div class="rounded-xl border border-white/10 bg-white/5 p-3">
				<Ticket class="size-8 text-senary" />
			</div>
			<div>
				<h2 class="text-2xl font-bold text-secondary">My Vouchers</h2>
				<p class="text-secondary/60">Manage your available vouchers</p>
			</div>
		</div>

		<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
			{error}
		</div>
	</div>
{:else}
	<div class="space-y-10" in:fade>
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-senary/10 p-2">
					<Sparkles class="size-5 text-senary" />
				</div>
				<h3 class="text-xl font-bold text-secondary">Available Vouchers</h3>
			</div>

			{#if ownedVouchers.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm"
				>
					<div class="mb-4 rounded-full bg-white/5 p-4 shadow-inner">
						<Ticket class="size-8 text-secondary/40" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-secondary">No vouchers available</h3>
					<p class="text-sm text-secondary/50">You don't have any active vouchers at the moment.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					{#each ownedVouchers as voucher (voucher.voucherID)}
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
										<p class="mt-1 text-sm text-secondary/60">{voucher.description}</p>
									</div>
									<div
										class="shrink-0 rounded-lg border border-senary/20 bg-senary/10 px-3 py-1 text-sm font-bold text-senary backdrop-blur-md"
									>
										{#if voucher.value}
											{voucher.value} OFF
										{:else if voucher.price}
											{voucher.price}%
										{:else}
											OFFER
										{/if}
									</div>
								</div>

								<div class="mt-2 space-y-2 border-t border-white/5 pt-4">
									<div class="flex items-center gap-2 text-sm text-secondary/50">
										<Calendar class="size-4 text-senary/50" />
										<span>Valid until: {formatDate(voucher.expireDate)}</span>
									</div>
									{#if voucher.buy_date}
										<div class="flex items-center gap-2 text-sm text-secondary/50">
											<Clock class="size-4 text-senary/50" />
											<span>Purchased: {formatDate(voucher.buy_date)}</span>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</div>
{/if}
