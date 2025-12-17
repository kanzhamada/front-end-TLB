<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { useSidebar } from './context.svelte.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		children,
		child,
		class: className,
		isActive = false,
		variant = 'default',
		size = 'default',
		tooltipContent,
		tooltipContentProps,
		...restProps
	}: WithElementRef<HTMLButtonAttributes & HTMLAnchorAttributes> & {
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		isActive?: boolean;
		variant?: 'default' | 'outline';
		size?: 'default' | 'sm' | 'lg';
		tooltipContent?: string | Snippet;
		tooltipContentProps?: ComponentProps<typeof Tooltip.Content>;
	} = $props();

	const sidebar = useSidebar();

	const mergedProps = $derived({
		class: cn(
			'peer/menu-button ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground outline-hidden flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:top-1.5 group-has-data-[sidebar=menu-action]/menu-item:right-1 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
			variant === 'default' && 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
			variant === 'outline' &&
				'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
			size === 'default' && 'h-8 text-sm',
			size === 'sm' && 'h-7 text-xs',
			size === 'lg' && 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
			className
		),
		'data-slot': 'sidebar-menu-button',
		'data-sidebar': 'menu-button',
		'data-size': size,
		'data-active': isActive,
		...restProps
	});
</script>

{#snippet Button({ props }: { props: Record<string, unknown> })}
	{#if child}
		{@render child({ props })}
	{:else}
		<button bind:this={ref} {...props}>
			{@render children?.()}
		</button>
	{/if}
{/snippet}

{#if !tooltipContent}
	{@render Button({ props: mergedProps })}
{:else}
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props: tooltipProps })}
				{@const mergedHandlers = {
					onclick: (e: MouseEvent) => {
						// Call original onclick from props (navigation)
						if (typeof mergedProps.onclick === 'function') {
							mergedProps.onclick(e);
						}
						// Call tooltip onclick (trigger)
						if (typeof tooltipProps.onclick === 'function') {
							tooltipProps.onclick(e);
						}
					}
				}}
				{@render Button({ props: { ...mergedProps, ...tooltipProps, ...mergedHandlers } })}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content
			side="right"
			align="center"
			hidden={sidebar.state !== 'collapsed' || sidebar.isMobile}
			{...tooltipContentProps}
		>
			{#if typeof tooltipContent === 'string'}
				{tooltipContent}
			{:else}
				{@render tooltipContent()}
			{/if}
		</Tooltip.Content>
	</Tooltip.Root>
{/if}
