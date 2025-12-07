<script lang="ts">
	import { Ticket, Coins, Calendar, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription,
		SheetClose
	} from '$lib/components/ui/sheet';
	import type { Voucher } from '$lib/api/customer/profile';
	import { cn } from '$lib/utils';

	type ExtendedVoucher = Voucher & { serviceName?: string };

	let {
		open = $bindable(false),
		voucher,
		userCoins = 0,
		onClose,
		onBuy
	} = $props<{
		open: boolean;
		voucher: ExtendedVoucher | null;
		userCoins: number;
		onClose: () => void;
		onBuy: (voucher: Voucher) => void;
	}>();

	function formatDate(dateString: string | undefined) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<Sheet bind:open onOpenChange={(isOpen) => !isOpen && onClose()}>
	<SheetContent
		side="top"
		class="mx-auto mt-22 w-full max-w-xl rounded-2xl border border-senary/20 bg-background/95 p-6 shadow-2xl backdrop-blur-xl"
	>
		{#if voucher}
			<div class="relative p-6">
				<!-- Header Pattern -->
				<div
					class="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-senary/5 blur-3xl"
				></div>
				<div
					class="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-secondary/5 blur-3xl"
				></div>

				<div class="relative z-10">
					<div class="mb-6 flex justify-center">
						<div class="rounded-2xl bg-senary/10 p-4 ring-1 ring-senary/20">
							<Ticket class="h-10 w-10 text-senary" />
						</div>
					</div>

					<div class="text-center">
						<div class="mb-2 flex items-center justify-center gap-2">
							<span
								class="rounded-full border border-senary/30 bg-senary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-senary uppercase"
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
									{voucher.price}% OFF
								{:else}
									SPECIAL OFFER
								{/if}
							</span>
						</div>

						<SheetTitle class="mb-2 text-2xl font-bold text-secondary">{voucher.title}</SheetTitle>
						<SheetDescription class="mb-6 text-sm leading-relaxed text-secondary/60">
							{voucher.description}
						</SheetDescription>

						<!-- Details -->
						<div class="mb-8 space-y-3 rounded-xl border border-white/5 bg-white/5 p-4">
							<div class="flex items-center justify-between text-sm">
								<span class="text-secondary/50">Valid Until</span>
								<span class="font-medium text-secondary">{formatDate(voucher.expireDate)}</span>
							</div>
							<div class="h-px bg-white/5"></div>
							<div class="flex items-center justify-between text-sm">
								<span class="text-secondary/50">Price</span>
								<div class="flex items-center gap-1.5 font-bold text-senary">
									<Coins class="h-4 w-4" />
									<span>{voucher.price} Coins</span>
								</div>
							</div>
							<!-- Service Name (if available in voucher or passed prop - for now assuming it might be in voucher or we handle it in parent) -->
							{#if voucher.serviceName}
								<div class="h-px bg-white/5"></div>
								<div class="flex items-center justify-between text-sm">
									<span class="text-secondary/50">Service</span>
									<span class="font-medium text-secondary">{voucher.serviceName}</span>
								</div>
							{/if}
						</div>

						<!-- Action -->
						<Button
							onclick={() => voucher && onBuy(voucher)}
							disabled={userCoins < voucher.price}
							class="w-full rounded-xl bg-senary py-6 text-sm font-bold tracking-widest text-primary uppercase transition hover:bg-white hover:shadow-lg hover:shadow-senary/20 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if userCoins < voucher.price}
								Not enough coins ({userCoins} / {voucher.price})
							{:else}
								Buy Voucher
							{/if}
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</SheetContent>
</Sheet>
