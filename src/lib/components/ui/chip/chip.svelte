<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	export let value: string[] = [];
	const storedValue = writable<string[]>(value);

	setContext('chip', { storedValue });

	// keep parent in sync
	storedValue.subscribe((v) => (value = v));
	$: storedValue.set(value);
</script>

<div>
	<slot />
</div>

<style>
</style>
