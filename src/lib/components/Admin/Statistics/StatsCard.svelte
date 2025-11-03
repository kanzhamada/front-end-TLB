<!-- StatsCard.svelte -->
<script lang="ts">
	import type { ComponentType, SvelteComponent } from 'svelte';

	let {
		title,
		value,
		icon: Icon,
		bgColor,
		iconColor
	}: {
		title: string;
		value: number | string;
		icon: ComponentType<SvelteComponent>;
		bgColor: string;
		iconColor: string;
	} = $props();
</script>

<div class="rounded-xl border border-gray-200/60 bg-white p-6 transition-shadow hover:shadow-sm">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-sm font-medium text-gray-600">{title}</p>
			<p class="mt-1 text-2xl font-light text-gray-900">{value}</p>
		</div>
		<div class="flex h-10 w-10 items-center justify-center rounded-lg {bgColor}">
			<svelte:component this={Icon} class="h-5 w-5 {iconColor}" />
		</div>
	</div>
</div>
