<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Send } from 'lucide-svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		onSend?: () => void;
	};

	let {
		class: className,
		value = $bindable(''),
		placeholder = 'Type a message...',
		disabled = false,
		onSend,
		...rest
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onSend?.();
		}
	}
</script>

<div class={cn('flex items-end gap-2 border-t p-4', className)} {...rest}>
	<Textarea
		bind:value
		{placeholder}
		{disabled}
		class="min-h-[2.5rem] max-h-32 resize-none"
		onkeydown={handleKeydown}
		rows={1}
	/>
	<Button size="icon" onclick={onSend} {disabled}>
		<Send class="size-4" />
		<span class="sr-only">Send</span>
	</Button>
</div>
