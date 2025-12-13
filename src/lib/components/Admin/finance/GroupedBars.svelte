<script lang="ts">
	import { getContext } from 'svelte';
    import type { Readable } from 'svelte/store';
    
    // Add tooltip to props
	let { data, xScale = undefined, yScale = undefined, tooltip = undefined } = $props();

    // Access chart store from context (LayerChart uses 'layerchart' key)
    const context = getContext('layerchart') as any;
    
    // Helper to determine if something is a store
    function isStore(value: any): value is Readable<any> {
        return value && typeof value.subscribe === 'function';
    }

    // Resolve stores/values from props or context
    // The props xScale/yScale might be the store OR the scale function itself
    // Or it might be passed as 'x' and 'y' (scale functions) directly?
    let xSource = $derived(xScale || context?.xScale);
    let ySource = $derived(yScale || context?.yScale);
    
    // Resolve tooltip source
    let tooltipSource = $derived(tooltip || context?.tooltip);

    let x = $derived.by(() => {
        if (!xSource) return null;
        if (isStore(xSource)) return $xSource;
        if (typeof xSource === 'function') return xSource;
        return null;
    });

    let y = $derived.by(() => {
        if (!ySource) return null;
        if (isStore(ySource)) return $ySource;
        if (typeof ySource === 'function') return ySource;
        return null;
    });

    $effect(() => {
        if (!x || !y) {
            console.warn('GroupedBars: Missing scales', { 
                props: { xScale, yScale },
                ctxKeys: context ? Object.keys(context) : [],
                xSourceType: typeof xSource,
                ySourceType: typeof ySource,
                isStoreX: isStore(xSource),
                isStoreY: isStore(ySource)
            });
        }
    });
</script>

{#if x && y && data}
    {#each data as d}
        <!-- Revenue Bar (Left) -->
        <rect 
            x={x(d.x)} 
            y={y(d.revenue)} 
            width={x.bandwidth() / 2} 
            height={Math.max(0, y(0) - y(d.revenue))} 
            rx={4}
            class="fill-senary transition-all hover:opacity-80 focus:outline-none"
            role="graphics-symbol"
            aria-label={`Revenue: ${d.revenue}`}
            onpointerenter={(e) => tooltipSource?.show(e, d)}
            onpointermove={(e) => tooltipSource?.show(e, d)}
            onpointerleave={() => tooltipSource?.hide()}
        />
        <!-- Expense Bar (Right) -->
        <rect 
            x={x(d.x) + x.bandwidth() / 2} 
            y={y(d.expenses)} 
            width={x.bandwidth() / 2} 
            height={Math.max(0, y(0) - y(d.expenses))} 
            rx={4}
            class="fill-red-500 transition-all hover:opacity-80 focus:outline-none"
            role="graphics-symbol"
            aria-label={`Expenses: ${d.expenses}`}
            onpointerenter={(e) => tooltipSource?.show(e, d)}
            onpointermove={(e) => tooltipSource?.show(e, d)}
            onpointerleave={() => tooltipSource?.hide()}
        />
    {/each}
{/if}
