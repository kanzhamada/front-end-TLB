<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import ReservationSheet from '$lib/components/User/Reservation/ReservationSheet.svelte';
	import { getReservationDetails, type ReservationResponse } from '$lib/api/customer/reservation';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	let reservation: ReservationResponse | null = $state(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		const reservationId = data.reservationId;

		if (!reservationId) {
			error = 'Reservation ID is required';
			loading = false;
			return;
		}

		const token = get(authStore).session?.access_token;
		if (!token) {
			console.error('User not authenticated, redirecting to login');
			goto('/auth/login');
			return;
		}

		try {
			const response = await getReservationDetails(reservationId, token);
			if (!response.success || !response.data || response.data.length === 0) {
				throw new Error(response.message || 'Failed to load reservation details');
			}

			reservation = response.data[0];
		} catch (err) {
			console.error('Error loading reservation details:', err);
			error =
				err instanceof Error ? err.message : 'An error occurred while loading reservation details';
		} finally {
			loading = false;
		}
	});

	function handleRescheduleCompleted() {
		// After successful rescheduling, redirect to reservation history
		goto('/profile/reservation');
	}
</script>

<div class="container mx-auto p-4">
	{#if loading}
		<div class="flex justify-center py-8">
			<div class="text-lg text-gray-600">Memuat data...</div>
		</div>
	{:else if error}
		<div class="rounded-lg bg-red-50 p-4 text-red-700">
			{error}
			<div class="mt-4">
				<Button onclick={() => goto('/profile/reservation')}>Kembali ke Daftar Reservasi</Button>
			</div>
		</div>
	{:else if reservation}
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-800">Reschedule Reservasi</h1>
			<p class="text-gray-600">Ubah tanggal dan waktu reservasi Anda</p>
		</div>

		<div class="mb-4 rounded-lg border border-gray-200 bg-orange-50 p-4">
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
				<div>
					<p class="text-sm text-gray-600">Tanggal</p>
					<p class="font-medium">{reservation.dateTime.date}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Waktu</p>
					<p class="font-medium">{reservation.dateTime.hour}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Barber</p>
					<p class="font-medium">{reservation.barber.name}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Layanan</p>
					<p class="font-medium">{reservation.service.name}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Status</p>
					<p class="font-medium">{reservation.status}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Invoice</p>
					<p class="font-medium">#{reservation.invoice || reservation.reservationID}</p>
				</div>
			</div>
		</div>

		<ReservationSheet
			triggerText="Reschedule Reservasi"
			reservationToReschedule={reservation}
			on:reservationCompleted={handleRescheduleCompleted}
		/>
	{:else}
		<div class="rounded-lg border border-dashed border-gray-300 p-8 text-center">
			<p class="text-gray-500">Reservasi tidak ditemukan</p>
			<div class="mt-4">
				<Button onclick={() => goto('/profile/reservation')}>Kembali ke Daftar Reservasi</Button>
			</div>
		</div>
	{/if}
</div>
