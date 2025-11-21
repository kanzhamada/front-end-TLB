<script lang="ts">
	import { Expand, Scissors } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { cn } from '$lib/utils'; // Assuming you have a cn utility, if not I will use template literals

	let { catalogue, index = 0, onSelect, onBook, class: className = '' } = $props();
</script>

<div
	in:scale={{ duration: 600, delay: index * 50, start: 0.9, easing: quintOut }}
	class={cn(
		'group relative overflow-hidden rounded-xl border border-white/5 bg-black/40 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-senary/30 hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.1)]',
		className
	)}
>
	<div class="relative aspect-[3/4] overflow-hidden">
		<img
			src={catalogue.image[0]}
			alt={catalogue.name}
			class="h-full w-full object-cover transition duration-1000 group-hover:scale-110 group-hover:grayscale-100"
		/>
		<div
			class="absolute inset-0 bg-gradient-to-t from-[#0A1F18] via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"
		></div>

		<!-- Hover Overlay -->
		<div
			class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:opacity-100"
		>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onSelect?.(catalogue);
				}}
				class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-2.5 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md transition hover:bg-white hover:text-black"
			>
				<Expand class="h-3 w-3" />
				VIEW
			</button>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onBook?.(catalogue);
				}}
				class="flex w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-senary py-2.5 text-[10px] font-bold tracking-widest text-primary uppercase shadow-lg transition hover:bg-white hover:text-black"
			>
				<Scissors class="h-3 w-3" />
				BOOK
			</button>
		</div>

		<!-- Labels -->
		<div
			class="absolute top-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[9px] font-bold tracking-wider text-white uppercase backdrop-blur-md"
		>
			{catalogue.type}
		</div>

		<div
			class="absolute bottom-0 left-0 w-full p-5 transition-transform duration-500 group-hover:translate-y-4 group-hover:opacity-0"
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
