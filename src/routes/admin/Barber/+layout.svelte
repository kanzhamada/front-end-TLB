<script lang="ts">
	import { getBarber } from '$lib/api/admin/barber.js';
	import HeaderAdmin from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let response = getBarber();

	let totalBarbers = response.barbers.length;
</script>

<div class="min-h-screen w-full bg-gray-50/30">
	<!-- Header Section -->
	<HeaderAdmin pageName="Barber" total={totalBarbers} description="Total Barbers" />
	<div class="px-6 py-6">
		<div class="mx-auto max-w-7xl">
			<div class="rounded-xl border border-gray-200/60 bg-white shadow-sm">
				<Toaster position="top-center" richColors />
				<slot />
			</div>
		</div>
	</div>
</div>
