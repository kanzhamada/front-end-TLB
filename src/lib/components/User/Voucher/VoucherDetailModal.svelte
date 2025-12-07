<script lang="ts">
	import { X, Ticket, Calendar, Coins } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Voucher } from '$lib/api/customer/profile';
	import { Button } from '$lib/components/ui/button';

	let {
		voucher = $bindable(),
		onClose,
		onBuy
	} = $props<{
		voucher: Voucher | null;
		onClose: () => void;
		onBuy: (voucher: Voucher) => void;
	}>();

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

{#if voucher}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
		transition:fade={{ duration: 300 }}
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose?.()}
	>
		<div
			class="relative flex w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A1F18] shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && onClose?.()}
			in:scale={{ start: 0.95, duration: 300, easing: quintOut }}
		>
			<!-- Header Pattern -->
			<div
				class="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-senary/5 blur-3xl"
			></div>
			<div
				class="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-secondary/5 blur-3xl"
			></div>

			<div class="relative p-6">
				<!-- Close Button -->
				<button
					onclick={onClose}
					class="absolute top-4 right-4 z-10 rounded-full bg-black/20 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
				>
					<X class="h-5 w-5" />
				</button>

				<!-- Icon -->
				<div class="mb-6 flex justify-center">
					<div class="rounded-2xl bg-senary/10 p-4 ring-1 ring-senary/20">
						<Ticket class="h-10 w-10 text-senary" />
					</div>
				</div>

				<!-- Content -->
				<div class="text-center">
					<div class="mb-2 flex items-center justify-center gap-2">
						<span
							class="rounded-full border border-senary/30 bg-senary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-senary uppercase"
						>
							{#if voucher.value}
								{voucher.value} OFF
							{:else if voucher.price}
								{voucher.price}% OFF
							{:else}
								SPECIAL OFFER
							{/if}
						</span>
					</div>

					<h3 class="mb-2 text-2xl font-bold text-secondary">{voucher.title}</h3>
					<p class="mb-6 text-sm leading-relaxed text-secondary/60">
						{voucher.description}
					</p>

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
					</div>

					<!-- Action -->
					<Button
						onclick={() => voucher && onBuy(voucher)}
						class="w-full rounded-xl bg-senary py-6 text-sm font-bold tracking-widest text-primary uppercase transition hover:bg-white hover:shadow-lg hover:shadow-senary/20"
					>
						Buy Voucher
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
