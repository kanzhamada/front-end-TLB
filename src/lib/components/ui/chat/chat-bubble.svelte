<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		variant?: 'sent' | 'received';
	};

	let { class: className, variant = 'received', children, ...rest } = $props();
</script>

<div
	class={cn(
		'relative max-w-[80%] rounded-2xl px-4 py-2 text-sm',
		variant === 'sent'
			? 'bg-[#2e6057] text-white rounded-br-none'
			: 'bg-gray-100 text-gray-800 rounded-bl-none',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
