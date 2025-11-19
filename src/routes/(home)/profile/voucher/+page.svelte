<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { getOwnedVouchers, type Voucher } from '$lib/api/customer/profile';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Ticket, Calendar, Wallet, Clock } from 'lucide-svelte';

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
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

{#if loading}
	<div class="space-y-6">
		<Card class="border border-gray-200">
			<CardHeader class="bg-[#2e6057]/5">
				<CardTitle class="flex items-center gap-2">
					<Ticket class="size-5 text-[#2e6057]" />
					<span class="text-[#2e6057]">Voucher Saya</span>
				</CardTitle>
				<CardDescription>Kelola voucher yang Anda miliki</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="animate-pulse space-y-4">
					{#each [1, 2] as _}
						<div class="rounded-lg border border-gray-200 p-4">
							<div class="flex items-center justify-between">
								<div class="space-y-2">
									<div class="h-4 w-3/4 rounded bg-gray-200"></div>
									<div class="h-3 w-full rounded bg-gray-200"></div>
								</div>
								<div class="h-6 w-16 rounded-full bg-gray-200"></div>
							</div>
							<div class="mt-3 flex items-center gap-2">
								<div class="h-4 w-4 rounded bg-gray-200"></div>
								<div class="h-3 w-1/2 rounded bg-gray-200"></div>
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	</div>
{:else if error}
	<div class="space-y-6">
		<Card class="border border-gray-200">
			<CardHeader class="bg-[#2e6057]/5">
				<CardTitle class="flex items-center gap-2">
					<Ticket class="size-5 text-[#2e6057]" />
					<span class="text-[#2e6057]">Voucher Saya</span>
				</CardTitle>
				<CardDescription>Kelola voucher yang Anda miliki</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="rounded-lg bg-red-50 p-4 text-red-500">
					{error}
				</div>
			</CardContent>
		</Card>
	</div>
{:else}
	<div class="space-y-6">
		<Card class="border border-gray-200">
			<CardHeader class="bg-[#2e6057]/5">
				<CardTitle class="flex items-center gap-2">
					<Ticket class="size-5 text-[#2e6057]" />
					<span class="text-[#2e6057]">Voucher Saya</span>
				</CardTitle>
				<CardDescription>Kelola voucher yang Anda miliki</CardDescription>
			</CardHeader>
			<CardContent>
				{#if ownedVouchers.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<div class="mb-4 rounded-full bg-[#e8ddd4] p-4">
							<Ticket class="size-8 text-[#2e6057]" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Voucher Belum Tersedia</h3>
						<p class="mb-4 text-sm text-gray-500">
							Anda belum memiliki voucher yang aktif saat ini
						</p>
						<Button class="bg-[#2e6057] hover:bg-[#2e6057]/80" disabled>Cek Kembali Nanti</Button>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#each ownedVouchers as voucher (voucher.voucherID)}
							<div class="rounded-lg border border-gray-200 p-4">
								<div class="flex items-center justify-between">
									<div>
										<h4 class="font-medium">{voucher.title}</h4>
										<p class="text-sm text-gray-600">{voucher.description}</p>
									</div>
									<div
										class="rounded-lg bg-[#2e6057]/10 px-3 py-1 text-sm font-semibold text-[#2e6057]"
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
								<div class="mt-3 space-y-2">
									<div class="flex items-center gap-2 text-sm text-gray-600">
										<Calendar class="size-4" />
										<span>Berlaku hingga: {formatDate(voucher.expireDate)}</span>
									</div>
									{#if voucher.buy_date}
										<div class="flex items-center gap-2 text-sm text-gray-600">
											<Clock class="size-4" />
											<span>Dibeli: {formatDate(voucher.buy_date)}</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
{/if}
