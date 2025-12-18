<script lang="ts">
	import { X } from 'lucide-svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { selectedService = $bindable(), onClose, onBook } = $props();

	function getOptimizedImage(url: string | undefined | null) {
		if (!url) return '';
		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}width=400&resize=cover&format=webp`;
	}
</script>

{#if selectedService}
	<div
		class="fixed inset-0 z-50 flex cursor-default items-center justify-center border-none bg-black/90 p-4 backdrop-blur-md outline-none"
		transition:fade={{ duration: 300 }}
		onclick={onClose}
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Escape' && onClose?.()}
		aria-label="Close modal"
	>
		<div
			class="flex max-h-[90vh] w-full max-w-3xl cursor-auto flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A1F18] shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="-1"
			onkeydown={(e) => e.key === 'Escape' && onClose?.()}
			in:scale={{ start: 0.95, duration: 300, easing: quintOut }}
		>
			<div class="relative">
				<Carousel.Root opts={{ loop: true }}>
					<Carousel.Content>
						{#each selectedService.catalogueImages as img, i}
							<Carousel.Item>
								<img
									src={getOptimizedImage(img.imageUrl)}
									alt={`${selectedService.name} ${i + 1}`}
									class="h-69 w-full object-cover sm:h-128"
								/>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					{#if selectedService.catalogueImages.length > 1}
						<Carousel.Previous
							class="absolute top-1/2 left-4 -translate-y-1/2 border-white/10 bg-black/40 text-white hover:bg-white hover:text-black"
						/>
						<Carousel.Next
							class="absolute top-1/2 right-4 -translate-y-1/2 border-white/10 bg-black/40 text-white hover:bg-white hover:text-black"
						/>
					{/if}
				</Carousel.Root>
				<button
					onclick={onClose}
					class="absolute top-4 right-4 cursor-pointer rounded-full bg-black/40 p-2 text-white transition hover:bg-white hover:text-black"
				>
					<X class="h-6 w-6" />
				</button>
			</div>
			<div class="flex-1 overflow-y-auto p-8">
				<div class="mb-2 flex items-center gap-3">
					<span
						class="rounded-full border border-senary/30 bg-senary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-senary uppercase"
						>{selectedService.type}
					</span>
				</div>
				<h3 class="mb-4 font-serif text-3xl text-secondary">{selectedService.name}</h3>
				<div class="mb-8">
					<h4 class="mb-2 text-sm font-bold tracking-widest text-secondary/80 uppercase">
						Deskripsi
					</h4>
					<p class="text-lg leading-relaxed font-light text-secondary/70">
						{selectedService.description}
					</p>
				</div>
				<button
					onclick={() => onBook?.(selectedService)}
					class="w-full rounded-xl bg-senary py-4 text-sm font-bold tracking-widest text-primary uppercase transition hover:bg-white hover:shadow-lg"
				>
					Buat Janji Temu
				</button>
			</div>
		</div>
	</div>
{/if}
