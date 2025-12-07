<script lang="ts">
	import CustomCursor from '$lib/components/ui/CustomCursor.svelte';
	import CustomerNavbar from '$lib/components/User/CustomerNavbar.svelte';
	import CustomerFootbar from '$lib/components/User/CustomerFootbar.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<div class="min-h-screen bg-slate-950">
	<CustomerNavbar />
	<main class="">
		<CustomCursor />
		<Toaster position="bottom-left" richColors />
		{@render children()}
	</main>
	<CustomerFootbar />
</div>
