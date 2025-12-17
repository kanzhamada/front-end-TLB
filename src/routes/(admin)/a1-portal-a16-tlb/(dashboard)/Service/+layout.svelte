<script lang="ts">
	import { getServices } from '$lib/api/admin/service';
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let totalServices = $state(0);

	onMount(async () => {
		const token = data.session?.access_token || '';
		const res = await getServices(fetch, token);
		if (res.success && res.data) {
			totalServices = res.data.length;
		}
	});
</script>

<div class="min-h-screen w-full bg-slate-950">
	<!-- Header Section -->
	<AdminHeader pageName="Service" total={totalServices} description="Total Services" />

	<div class="px-6 py-6">
		<div class="mx-auto max-w-7xl">
			{@render children?.()}
		</div>
	</div>
</div>
