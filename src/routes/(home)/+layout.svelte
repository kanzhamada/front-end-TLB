<script lang="ts">
	import CustomerNavbar from '$lib/components/User/CustomerNavbar.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-[#e8ddd4]">
	<CustomerNavbar />
	<main class="">
		{@render children()}
	</main>
</div>
