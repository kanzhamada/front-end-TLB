<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		label,
		variant = 'ghost',
		...restProps
	}: {
		label: string;
		variant?: ComponentProps<typeof Button>['variant'];
	} & ComponentProps<typeof Button> = $props();
</script>

<Button
	{variant}
	{...restProps}
	class="h-auto p-0 font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
>
	{label}
	<ArrowUpDownIcon class="ml-2 h-3 w-3" />
</Button>
