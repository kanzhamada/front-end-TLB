<script lang="ts">
	import { X, Ticket, Coins, ShoppingBag, Check, Layers, Loader2 } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { authStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription,
		SheetClose
	} from '$lib/components/ui/sheet';
	import type { OwnedVoucher } from '$lib/api/shared/api';
	import type { Voucher } from '$lib/api/customer/profile';
	import { cn } from '$lib/utils';

	let {
		open = $bindable(false),
		ownedVouchers = [],
		availableVouchers = [],
		userCoins = 0,
		selectedVoucherId = null,
		onClose,
		onSelect,
		onBuy,
		selectedServiceId,
		onRedeemApply
	} = $props<{
		open: boolean;
		ownedVouchers: OwnedVoucher[];
		availableVouchers: Voucher[];
		userCoins: number;
		selectedVoucherId: string | null;
		onClose: () => void;
		onSelect: (voucherId: string | null) => void;
		onBuy: (voucher: Voucher) => void;
		selectedServiceId: string | null;
		onRedeemApply: (code: string, discount: number) => void;
	}>();

	let redeemCodeInput = $state('');
	let redeemLoading = $state(false);

	async function handleRedeem() {
		if (!redeemCodeInput.trim()) return;

		const token = get(authStore).session?.access_token;
		if (!token) {
			toast.error('Please login to redeem code');
			return;
		}

		redeemLoading = true;
		try {
			const response = await fetch(
				`${import.meta.env.PUBLIC_API_URL}/customer/validate-redeem-code`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({
						serviceId: selectedServiceId,
						redeemCode: redeemCodeInput
					})
				}
			);

			const data = await response.json();

			if (data.success) {
				toast.success(data.message);
				onRedeemApply(data.data.redeemCode, data.data.value);
				redeemCodeInput = '';
			} else {
				console.log(data);
				toast.warning(data.error || data.message || 'Invalid redeem code');
			}
		} catch (error) {
			console.error('Error redeeming code:', error);
			toast.error('Failed to validate redeem code');
		} finally {
			redeemLoading = false;
		}
	}

	let activeTab = $state<'owned' | 'available'>('owned');

	function formatDate(dateString: string | undefined) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<Sheet bind:open onOpenChange={(isOpen) => !isOpen && onClose()}>
	<SheetContent
		side="bottom"
		class="h-[85vh] w-full rounded-t-[2rem] border-t border-white/10 bg-[#0A1F18] p-0 shadow-2xl sm:max-w-full"
	>
		<div class="mb-6 flex items-center justify-between border-b border-white/5 p-6">
			<div>
				<SheetTitle class="mb-6 text-2xl font-bold text-secondary">Select Voucher</SheetTitle>
				<SheetDescription class="text-sm text-secondary/60">
					Choose a voucher or buy a new one
				</SheetDescription>
			</div>
			<div class="flex items-center gap-4">
				<div
					class="flex items-center gap-2 rounded-full border border-senary/20 bg-senary/10 px-4 py-2"
				>
					<Coins class="h-4 w-4 text-senary" />
					<span class="font-bold text-senary">{userCoins} Coins</span>
				</div>
			</div>
		</div>

		<!-- Redeem Code Section -->
		<div class="px-6 pb-4">
			<div class="flex gap-2">
				<Input
					placeholder="Enter redeem code"
					bind:value={redeemCodeInput}
					class="border-white/10 bg-white/5 text-secondary placeholder:text-secondary/40 focus-visible:ring-senary"
				/>
				<Button
					disabled={redeemLoading || !redeemCodeInput}
					onclick={handleRedeem}
					class="min-w-[100px] bg-senary text-primary hover:bg-senary/90"
				>
					{#if redeemLoading}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						Apply
					{/if}
				</Button>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex border-b border-white/5 px-6">
			<button
				class={cn(
					'relative px-6 py-4 text-sm font-medium transition-colors',
					activeTab === 'owned' ? 'text-senary' : 'text-secondary/60 hover:text-secondary'
				)}
				onclick={() => (activeTab = 'owned')}
			>
				My Vouchers
				{#if activeTab === 'owned'}
					<div class="absolute bottom-0 left-0 h-0.5 w-full bg-senary"></div>
				{/if}
			</button>
			<button
				class={cn(
					'relative px-6 py-4 text-sm font-medium transition-colors',
					activeTab === 'available' ? 'text-senary' : 'text-secondary/60 hover:text-secondary'
				)}
				onclick={() => (activeTab = 'available')}
			>
				Available to Buy
				{#if activeTab === 'available'}
					<div class="absolute bottom-0 left-0 h-0.5 w-full bg-senary"></div>
				{/if}
			</button>
		</div>

		<!-- Content -->
		<div class="h-[calc(85vh-180px)] overflow-y-auto p-6">
			{#if activeTab === 'owned'}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<!-- No Voucher Option -->
					<button
						class={cn(
							'group relative flex flex-col items-start justify-between rounded-xl border p-6 text-left transition-all',
							selectedVoucherId === null
								? 'border-senary bg-senary/10 ring-1 ring-senary'
								: 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
						)}
						onclick={() => onSelect(null)}
					>
						<div class="mb-4 rounded-full bg-white/10 p-3">
							<X class="h-6 w-6 text-secondary" />
						</div>
						<div>
							<h3 class="font-bold text-secondary">Don't use voucher</h3>
							<p class="text-sm text-secondary/60">Proceed without discount</p>
						</div>
					</button>

					{#each Object.values(ownedVouchers.reduce((acc, v) => {
								if (!acc[v.voucherID]) {
									acc[v.voucherID] = { ...v, count: 0 };
								}
								acc[v.voucherID].count++;
								return acc;
							}, {} as Record<string, OwnedVoucher & { count: number }>)) as voucher}
						<button
							class={cn(
								'group relative flex flex-col justify-between rounded-xl border p-6 text-left transition-all',
								selectedVoucherId === voucher.voucherID
									? 'border-senary bg-senary/10 ring-1 ring-senary'
									: 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
							)}
							onclick={() => onSelect(voucher.voucherID)}
						>
							<div class="mb-4 flex w-full items-start justify-between">
								<div class="rounded-full bg-senary/10 p-3">
									<Ticket class="h-6 w-6 text-senary" />
								</div>
								<div class="flex flex-col items-end gap-2">
									{#if voucher.value || voucher.discountAmount}
										<span class="rounded-full bg-senary/20 px-2 py-1 text-xs font-bold text-senary">
											Diskon {new Intl.NumberFormat('id-ID', {
												style: 'currency',
												currency: 'IDR'
											})
												.format(voucher.value)
												.replace('Rp', '')
												.replace(',00', '')}
										</span>
									{:else if voucher.discountPercentage}
										<span class="rounded-full bg-senary/20 px-2 py-1 text-xs font-bold text-senary">
											{voucher.discountPercentage}% OFF
										</span>
									{/if}
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

							<div class="space-y-1">
								<h3 class="line-clamp-1 font-bold text-secondary">
									{voucher.title ?? voucher.name}
								</h3>
								<p class="text-xs font-medium text-senary/80">
									{voucher.serviceName ?? 'All Services'}
								</p>
								<p class="line-clamp-2 text-sm text-secondary/60">{voucher.description}</p>
								<p class="pt-2 text-xs text-secondary/40">
									Expires: {formatDate(
										voucher.expireDate ?? voucher.expiredAt ?? voucher.expiredDate
									)}
								</p>
							</div>
						</button>
					{/each}
				</div>

				{#if ownedVouchers.length === 0}
					<div class="mt-8 text-center">
						<p class="text-secondary/50">You don't have any vouchers yet.</p>
						<button
							class="mt-2 text-senary hover:underline"
							onclick={() => (activeTab = 'available')}
						>
							Browse available vouchers
						</button>
					</div>
				{/if}
			{:else}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each availableVouchers as voucher}
						<div
							class="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-senary/30 hover:bg-white/10"
						>
							<div class="mb-4 flex w-full items-start justify-between">
								<div class="rounded-full bg-senary/10 p-3">
									<ShoppingBag class="h-6 w-6 text-senary" />
								</div>
								<span class="rounded-full bg-senary/20 px-2 py-1 text-xs font-bold text-senary">
									Diskon {new Intl.NumberFormat('id-ID', {
										style: 'currency',
										currency: 'IDR'
									})
										.format(voucher.value)
										.replace('Rp', '')
										.replace(',00', '')}
								</span>
							</div>

							<div class="mb-4 space-y-1">
								<h3 class="line-clamp-1 font-bold text-secondary">{voucher.title}</h3>
								<p class="text-xs font-medium text-senary/80">
									{voucher.serviceName ?? 'All Services'}
								</p>
								<p class="line-clamp-2 text-sm text-secondary/60">{voucher.description}</p>
								<p class="pt-2 text-xs text-secondary/40">
									Valid until: {formatDate(voucher.expireDate)}
								</p>
							</div>

							<Button
								class="w-full bg-senary text-primary hover:bg-senary/90"
								onclick={() => onBuy(voucher)}
								disabled={userCoins < voucher.price}
							>
								{#if userCoins < voucher.price}
									Coin tidak cukup
								{:else}
									Beli <Coins class="h-3 w-3" /> {voucher.price}
								{/if}
							</Button>
						</div>
					{/each}
				</div>

				{#if availableVouchers.length === 0}
					<div class="mt-8 text-center text-secondary/50">
						No vouchers available for purchase at the moment.
					</div>
				{/if}
			{/if}
		</div>
	</SheetContent>
</Sheet>
