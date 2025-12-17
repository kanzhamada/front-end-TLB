<!-- StatsCard.svelte -->
<script lang="ts">
	import type { ComponentType, SvelteComponent } from 'svelte';
	import { ArrowUp, ArrowDown } from 'lucide-svelte';

	let {
		title,
		value,
		icon: Icon,
		bgColor,
		iconColor,
		trend = 0,
		trendLabel = 'Compared to last month'
	}: {
		title: string;
		value: number | string;
		icon: ComponentType<SvelteComponent>;
		bgColor?: string;
		iconColor?: string;
		trend?: number;
		trendLabel?: string;
	} = $props();
</script>

<div
	class="admin-glass-panel relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
>
	<div class="flex justify-between">
		<div class="space-y-4">
			<p class="text-sm font-medium text-gray-500">{title}</p>
			<h3 class="text-3xl font-bold text-gray-900">{value}</h3>

			<div class="flex items-center gap-2 text-sm">
				{#if trend !== 0}
					<span class={trend > 0 ? 'text-emerald-600' : 'text-red-500'}>
						<span class="flex items-center font-medium">
							{#if trend > 0}
								<ArrowUp class="mr-1 h-4 w-4" />
							{:else}
								<ArrowDown class="mr-1 h-4 w-4" />
							{/if}
							{Math.abs(trend)}%
						</span>
					</span>
					<span class="text-gray-400">{trendLabel}</span>
				{/if}
			</div>
		</div>

		<div
			class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
		>
			<svelte:component this={Icon} class="h-6 w-6" />
		</div>
	</div>
</div>
