<script lang="ts">
	let { options, selectedFilter, onSelect } = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
	<span class="text-xs font-bold tracking-widest text-secondary/80 uppercase">Filter:</span>
	{#each options as option}
		<button
			onclick={() => onSelect(option.value)}
			class={`rounded-full px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
				selectedFilter === (option.value || 'All')
					? 'bg-senary text-primary shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]'
					: 'border border-white/10 bg-transparent text-secondary/80 hover:border-senary/50 hover:text-senary'
			}`}
		>
			{option.label}
		</button>
	{/each}
</div>
