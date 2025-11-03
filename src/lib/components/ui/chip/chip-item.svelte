<script lang="ts">
	import { getContext } from 'svelte';
	import { onMount } from 'svelte';
	import Button from '../button/button.svelte';

	type ChipContext = { storedValue: import('svelte/store').Writable<string[]> };
	const chip = getContext<ChipContext>('chip');
	const storedValue = chip.storedValue;

	export let value: string; // actual value passed in

	function toggle() {
		const current = [...$storedValue];
		const index = current.indexOf(value);
		if (index !== -1) {
			current.splice(index, 1); // remove
		} else {
			current.push(value); // add
		}
		storedValue.set(current);
	}
</script>

<Button
	variant={$storedValue.includes(value) ? 'default' : 'outline'}
	onclick={toggle}
	class="w-full text-sm shadow-none"
>
	<slot />
</Button>

<style>
</style>
