<script lang="ts">
	import { Expand, Scissors } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { cn } from '$lib/utils'; // Assuming you have a cn utility, if not I will use template literals

	let { catalogue, index = 0, onSelect, onBook, class: className = '' } = $props();

	let isActive = $state(false);

	function toggleActive() {
		isActive = !isActive;
	}

	function getOptimizedImage(url: string | undefined | null) {
		if (!url) return '';
		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}width=400&resize=cover&format=webp`;
	}
</script>

<div
	in:scale={{ duration: 600, delay: index * 50, start: 0.9, easing: quintOut }}
	class={cn(
		'group relative overflow-hidden rounded-xl border border-white/5 bg-black/40 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-senary/30 hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.1)]',
		className
	)}
	onclick={toggleActive}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') toggleActive();
	}}
>
	<div class="relative aspect-[3/4] overflow-hidden">
		<img
			src={getOptimizedImage(catalogue.catalogueImages?.[0]?.imageUrl)}
			alt={catalogue.name}
			class="h-full w-full object-cover transition duration-1000 group-hover:scale-110 group-hover:grayscale-100"
		/>
		<div
			class="absolute inset-0 bg-gradient-to-t from-[#0A1F18] via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"
		></div>

		<!-- Hover Overlay -->
		<div
			class={cn(
				'absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-[2px] transition-all duration-500',
				isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
			)}
		>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onSelect?.(catalogue);
				}}
				class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-2.5 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md transition hover:bg-white hover:text-black"
			>
				<Expand class="h-3 w-3" />
				LIHAT
			</button>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onBook?.(catalogue);
				}}
				class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-senary py-2.5 text-[10px] font-bold tracking-widest text-primary uppercase shadow-lg transition hover:bg-white hover:text-black"
			>
				<Scissors class="h-3 w-3" />
				PESAN
			</button>
		</div>

		<!-- Labels -->
		<div
			class="absolute top-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[9px] font-bold tracking-wider text-white uppercase backdrop-blur-md"
		>
			{catalogue.type}
		</div>

		<div
			class={cn(
				'absolute bottom-0 left-0 w-full p-5 transition-transform duration-500',
				isActive
					? 'translate-y-4 opacity-0'
					: 'translate-y-0 opacity-100 group-hover:translate-y-4 group-hover:opacity-0'
			)}
		>
			<h4 class="truncate font-serif text-lg text-white">{catalogue.name}</h4>
			{#if catalogue.description}
				<p class="mt-1 line-clamp-2 text-xs font-light text-secondary/70">
					{catalogue.description}
				</p>
			{/if}
		</div>
	</div>
</div>
