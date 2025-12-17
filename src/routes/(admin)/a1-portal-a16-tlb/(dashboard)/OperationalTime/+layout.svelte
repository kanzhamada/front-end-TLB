<script lang="ts">
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen w-full bg-slate-950">
	<!-- Header Section -->
	<AdminHeader pageName="Operational Time" description="Operational Times" />
	<div class="px-6 py-6">
		<div class="mx-auto max-w-7xl">
			{@render children?.()}
		</div>
	</div>
</div>