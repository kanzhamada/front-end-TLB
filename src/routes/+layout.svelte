<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/three_lights_barbershop_logo.svg" />
</svelte:head>

{@render children()}
