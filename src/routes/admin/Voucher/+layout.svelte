<script lang="ts">
	import { getVoucher } from '$lib/api/admin/voucher';
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let response = getVoucher();
	let totalVouchers = response.vouchers.length;
</script>

<div class="min-h-screen w-full bg-gray-50/30">
	<!-- Header Section -->
	<AdminHeader pageName="Voucher" total={totalVouchers} description="Total Vouchers" />
	<div class="px-6 py-6">
		<div class="mx-auto max-w-7xl">
			<div class="rounded-xl border border-gray-200/60 bg-white shadow-sm">
				<Toaster position="top-center" richColors />
				<slot />
			</div>
		</div>
	</div>
</div>
