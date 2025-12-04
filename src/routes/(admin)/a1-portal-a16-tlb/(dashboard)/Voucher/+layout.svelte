<script lang="ts">
	import { getVouchers } from '$lib/api/admin/voucher';
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let totalVouchers = $state(0);

	onMount(async () => {
		const token = data.session?.access_token || '';
		const res = await getVouchers(fetch, token);
		if (res.success && res.data) {
			totalVouchers = res.data.length;
		}
	});
</script>

<div class="min-h-screen w-full bg-slate-950">
	<!-- Header Section -->
	<AdminHeader pageName="Voucher" total={totalVouchers} description="Total Vouchers" />
	<div class="px-6 py-6">
		<div class="mx-auto max-w-7xl">
			<Toaster position="top-center" richColors />
			{@render children?.()}
		</div>
	</div>
</div>
