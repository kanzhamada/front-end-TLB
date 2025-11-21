<script lang="ts">
	import { X } from 'lucide-svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let { selectedService = $bindable(), onClose } = $props();
</script>

{#if selectedService}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
		transition:fade={{ duration: 300 }}
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose?.()}
	>
		<div
			class="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A1F18] shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && onClose?.()}
			in:scale={{ start: 0.95, duration: 300, easing: quintOut }}
		>
			<div class="relative">
				<Carousel.Root opts={{ loop: true }}>
					<Carousel.Content>
						{#each selectedService.image as src, i}
							<Carousel.Item>
								<img
									{src}
									alt={`${selectedService.name} ${i + 1}`}
									class="h-128 w-full object-cover"
								/>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					{#if selectedService.image.length > 1}
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
			<div class="p-8">
				<div class="mb-2 flex items-center gap-3">
					<span
						class="rounded-full border border-senary/30 bg-senary/10 px-3 py-1 text-[10px] font-bold tracking-widest text-senary uppercase"
						>{selectedService.type}
					</span>
				</div>
				<h3 class="mb-4 font-serif text-3xl text-secondary">{selectedService.name}</h3>
				<div class="mb-8">
					<h4 class="mb-2 text-sm font-bold tracking-widest text-secondary/80 uppercase">
						Description
					</h4>
					<p class="text-lg leading-relaxed font-light text-secondary/70">
						{selectedService.description}
					</p>
				</div>
				<button
					class="w-full rounded-xl bg-senary py-4 text-sm font-bold tracking-widest text-primary uppercase transition hover:bg-white hover:shadow-lg"
				>
					Book Appointment
				</button>
			</div>
		</div>
	</div>
{/if}
