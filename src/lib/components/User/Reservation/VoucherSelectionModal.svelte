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

<<<<<<< HEAD
=======
	console.log(availableVouchers);

>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
	let redeemCodeInput = $state('');
	let redeemLoading = $state(false);

	async function handleRedeem() {
		if (!redeemCodeInput.trim()) return;

		const token = get(authStore).session?.access_token;
		if (!token) {
<<<<<<< HEAD
			toast.error('Please login to redeem code');
=======
			toast.error('Silakan login untuk menukarkan kode');
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
				toast.warning(data.error || data.message || 'Invalid redeem code');
			}
		} catch (error) {
			console.error('Error redeeming code:', error);
			toast.error('Failed to validate redeem code');
=======
				toast.warning(data.error || data.message || 'Kode penukaran tidak valid');
			}
		} catch (error) {
			console.error('Error redeeming code:', error);
			toast.error('Gagal memvalidasi kode penukaran');
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
		} finally {
			redeemLoading = false;
		}
	}

	let activeTab = $state<'owned' | 'available'>('owned');

	function formatDate(dateString: string | undefined) {
		if (!dateString) return '-';
<<<<<<< HEAD
		return new Date(dateString).toLocaleDateString('en-US', {
=======
		return new Date(dateString).toLocaleDateString('id-ID', {
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
				<SheetTitle class="mb-6 text-2xl font-bold text-secondary">Select Voucher</SheetTitle>
				<SheetDescription class="text-sm text-secondary/60">
					Choose a voucher or buy a new one
=======
				<SheetTitle class="mb-6 text-2xl font-bold text-secondary">Pilih Voucher</SheetTitle>
				<SheetDescription class="text-sm text-secondary/60">
					Pilih voucher atau beli yang baru
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
				</SheetDescription>
			</div>
			<div class="flex items-center gap-4">
				<div
					class="flex items-center gap-2 rounded-full border border-senary/20 bg-senary/10 px-4 py-2"
				>
					<Coins class="h-4 w-4 text-senary" />
<<<<<<< HEAD
					<span class="font-bold text-senary">{userCoins} Coins</span>
=======
					<span class="font-bold text-senary">{userCoins} Koin</span>
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
				</div>
			</div>
		</div>

		<!-- Redeem Code Section -->
		<div class="px-6 pb-4">
			<div class="flex gap-2">
				<Input
<<<<<<< HEAD
					placeholder="Enter redeem code"
=======
					placeholder="Masukkan kode penukaran"
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
						Apply
=======
						Gunakan
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
				Available to Buy
=======
				Tersedia untuk Dibeli
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
							<h3 class="font-bold text-secondary">Don't use voucher</h3>
							<p class="text-sm text-secondary/60">Proceed without discount</p>
=======
							<h3 class="font-bold text-secondary">Jangan gunakan voucher</h3>
							<p class="text-sm text-secondary/60">Lanjutkan tanpa diskon</p>
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
											{voucher.discountPercentage}% OFF
=======
											Diskon {voucher.discountPercentage}%
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
									{voucher.serviceName ?? 'All Services'}
								</p>
								<p class="line-clamp-2 text-sm text-secondary/60">{voucher.description}</p>
								<p class="pt-2 text-xs text-secondary/40">
									Expires: {formatDate(
=======
									{voucher.serviceName ?? 'Semua Layanan'}
								</p>
								<p class="line-clamp-2 text-sm text-secondary/60">{voucher.description}</p>
								<p class="pt-2 text-xs text-secondary/40">
									Berlaku sampai: {formatDate(
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
										voucher.expireDate ?? voucher.expiredAt ?? voucher.expiredDate
									)}
								</p>
							</div>
						</button>
					{/each}
				</div>

				{#if ownedVouchers.length === 0}
					<div class="mt-8 text-center">
<<<<<<< HEAD
						<p class="text-secondary/50">You don't have any vouchers yet.</p>
=======
						<p class="text-secondary/50">Anda belum memiliki voucher.</p>
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
						<button
							class="mt-2 text-senary hover:underline"
							onclick={() => (activeTab = 'available')}
						>
<<<<<<< HEAD
							Browse available vouchers
=======
							Lihat voucher yang tersedia
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
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
<<<<<<< HEAD
									{voucher.serviceName ?? 'All Services'}
								</p>
								<p class="line-clamp-2 text-sm text-secondary/60">{voucher.description}</p>
								<p class="pt-2 text-xs text-secondary/40">
									Valid until: {formatDate(voucher.expireDate)}
=======
									{voucher.serviceName ?? 'Semua Layanan'}
								</p>
								<p class="line-clamp-2 text-sm text-secondary/60">{voucher.description}</p>
								<p class="pt-2 text-xs text-secondary/40">
									Berlaku sampai: {formatDate(voucher.expireDate)}
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
								</p>
							</div>

							<Button
								class="w-full bg-senary text-primary hover:bg-senary/90"
								onclick={() => onBuy(voucher)}
								disabled={userCoins < voucher.price}
							>
								{#if userCoins < voucher.price}
<<<<<<< HEAD
									Coin tidak cukup
=======
									Koin tidak cukup
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
								{:else}
									Beli <Coins class="h-3 w-3" /> {voucher.price}
								{/if}
							</Button>
						</div>
					{/each}
				</div>

				{#if availableVouchers.length === 0}
					<div class="mt-8 text-center text-secondary/50">
<<<<<<< HEAD
						No vouchers available for purchase at the moment.
=======
						Tidak ada voucher yang tersedia untuk dibeli saat ini.
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
					</div>
				{/if}
			{/if}
		</div>
	</SheetContent>
</Sheet>
