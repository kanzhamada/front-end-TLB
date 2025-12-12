<script lang="ts">
	import { getContext } from 'svelte';
    
	let { data } = $props();

    // Access chart store from context (LayerChart uses 'layerchart' key)
    const chartContext = getContext('layerchart') as any;

    const xScale = $derived(chartContext?.xScale);
    const yScale = $derived(chartContext?.yScale);
</script>

{#if chartContext && $xScale && $yScale && data}
    {#each data as d}
        <!-- Revenue Bar (Left) -->
        <rect 
            x={$xScale(d.x)} 
            y={$yScale(d.revenue)} 
            width={$xScale.bandwidth() / 2} 
            height={Math.max(0, $yScale(0) - $yScale(d.revenue))} 
            rx={4}
            class="fill-senary transition-all hover:opacity-80" 
        />
        <!-- Expense Bar (Right) -->
        <rect 
            x={$xScale(d.x) + $xScale.bandwidth() / 2} 
            y={$yScale(d.expenses)} 
            width={$xScale.bandwidth() / 2} 
            height={Math.max(0, $yScale(0) - $yScale(d.expenses))} 
            rx={4}
            class="fill-red-500 transition-all hover:opacity-80" 
        />
    {/each}
{/if}
