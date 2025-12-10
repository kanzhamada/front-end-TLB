<script lang="ts">
	import CustomerNavbar from '$lib/components/User/CustomerNavbar.svelte';
	import CustomerFootbar from '$lib/components/User/CustomerFootbar.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<svelte:head>
	<title>Three Lights Barbershop</title>
</svelte:head>

<div class="min-h-screen bg-slate-950">
	<div class="mx-auto max-w-6xl">
		<CustomerNavbar />
	</div>
	<main class="">
		<Toaster position="bottom-left" richColors />
		{@render children()}
	</main>
	<CustomerFootbar />
</div>
