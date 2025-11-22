<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let { class: className, children, ...rest } = $props();
</script>

<div class={cn('flex flex-col gap-4 p-4', className)} {...rest}>
	{@render children?.()}
</div>
