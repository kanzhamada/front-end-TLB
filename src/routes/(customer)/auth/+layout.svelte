<script lang="ts">
	import CustomerNavbar from '$lib/components/User/CustomerNavbar.svelte';
	import CustomerFootbar from '$lib/components/User/CustomerFootbar.svelte';
	import CustomCursor from '$lib/components/ui/CustomCursor.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-slate-950">
	<CustomerNavbar />
	<main class="">
		<CustomCursor />
		{@render children()}
	</main>
	<CustomerFootbar />
</div>
