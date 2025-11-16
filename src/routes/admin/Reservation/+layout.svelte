<script lang="ts">
	import { getReservations } from '$lib/api/admin/reservation.js';
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';

	let response = getReservations();

	let totalReservations = response.reservations.length;
</script>

<div class="min-h-screen w-full bg-gray-50/30">
	<!-- Header Section -->
	<AdminHeader pageName="Reservation" total={totalReservations} description="Total Bookings" />
	<div class="px-6 py-6">
		<div class="mx-auto max-w-7xl">
			<div class="rounded-xl border border-gray-200/60 bg-white shadow-sm">
				<slot />
			</div>
		</div>
	</div>
</div>
