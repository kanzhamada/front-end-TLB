<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import {
		getReservations,
		type ReservationResponse,
		cancelReservation,
		createTransaction
	} from '$lib/api/customer/reservation';
	import { goto } from '$app/navigation';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';

	let reservations: ReservationResponse[] = $state([]);
	let activeReservations: ReservationResponse[] = $state([]);
	let historyReservations: ReservationResponse[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const activeStatuses = ['waiting', 'onGoing', 'waitingForPayment', 'requestToReschedule'];
	const historyStatuses = ['completed', 'canceledByUser', 'canceledByAdmin', 'declined', 'expired'];

	// State for modals and actions
	let showCancelDialog = $state(false);
	let reservationToCancel = $state<ReservationResponse | null>(null);
	let showDownPaymentWarning = $state(false);
	let processingReservationId = $state<string | null>(null);

	// Check if user is authenticated before allowing access to this page
	onMount(async () => {
		const token = get(authStore).session?.access_token;
		if (!token) {
			console.error('User not authenticated, redirecting to login');
			goto('/auth/login');
			return;
		}

		// Load reservations after authentication check
		await loadReservations();
	});

	async function loadReservations() {
		loading = true;
		error = null;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			const response = await getReservations(token);
			if (!response.success) {
				throw new Error(response.message || 'Failed to load reservations');
			}

			reservations = response.data || [];
			activeReservations = reservations.filter((res) => activeStatuses.includes(res.status));
			historyReservations = reservations.filter((res) => historyStatuses.includes(res.status));
		} catch (err) {
			console.error('Error loading reservations:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading reservations';
		} finally {
			loading = false;
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'waiting':
				return 'Menunggu';
			case 'onGoing':
				return 'Sedang Berlangsung';
			case 'waitingForPayment':
				return 'Menunggu Pembayaran';
			case 'completed':
				return 'Selesai';
			case 'canceledByUser':
				return 'Dibatalkan oleh Pengguna';
			case 'canceledByAdmin':
				return 'Dibatalkan oleh Admin';
			case 'declined':
				return 'Ditolak';
			case 'expired':
				return 'Kedaluwarsa';
			case 'requestToReschedule':
				return 'Permintaan Reschedule';
			default:
				return status;
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'waiting':
				return 'bg-blue-100 text-blue-800';
			case 'onGoing':
				return 'bg-yellow-100 text-yellow-800';
			case 'waitingForPayment':
				return 'bg-orange-100 text-orange-800';
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'canceledByUser':
			case 'canceledByAdmin':
			case 'declined':
			case 'expired':
				return 'bg-red-100 text-red-800';
			case 'requestToReschedule':
				return 'bg-purple-100 text-purple-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	async function handleCancelReservation(reservation: ReservationResponse) {
		reservationToCancel = reservation;
		// Show down payment warning if status is waitingForPayment
		showDownPaymentWarning = reservation.status === 'waitingForPayment';
		showCancelDialog = true;
	}

	async function confirmCancelReservation() {
		if (!reservationToCancel) return;

		const token = get(authStore).session?.access_token;
		if (!token) {
			error = 'User not authenticated';
			showCancelDialog = false;
			return;
		}

		processingReservationId = reservationToCancel.reservationID;

		try {
			const response = await cancelReservation(reservationToCancel.reservationID, token);
			if (!response.success) {
				throw new Error(response.message || 'Failed to cancel reservation');
			}

			// Refresh the reservations list
			await loadReservations();
		} catch (err) {
			console.error('Error canceling reservation:', err);
			error = err instanceof Error ? err.message : 'An error occurred while canceling reservation';
		} finally {
			processingReservationId = null;
			showCancelDialog = false;
			reservationToCancel = null;
		}
	}

	async function handleRescheduleReservation(reservation: ReservationResponse) {
		// Navigate to the reschedule page with the reservation ID
		goto(`/reservation/reschedule?id=${reservation.reservationID}`);
	}

	async function handlePayNow(reservation: ReservationResponse) {
		const token = get(authStore).session?.access_token;
		console.log('Token:', token);
		if (!token) {
			error = 'User not authenticated';
			return;
		}

		processingReservationId = reservation.reservationID;

		try {
			const response = await createTransaction(reservation.reservationID, token);
			if (!response.success) {
				throw new Error(response.message || 'Failed to create transaction');
			}

			// Redirect to payment page using the redirect_url from the response
			if (response.data?.redirect_url) {
				// Open the payment page in the same tab (redirect user)
				window.location.href = response.data.redirect_url;
			}
		} catch (err) {
			console.error('Error creating transaction:', err);
			error = err instanceof Error ? err.message : 'An error occurred while creating transaction';
		} finally {
			processingReservationId = null;
		}
	}
</script>

<div>
	{#if loading}
		<div class="flex justify-center py-8">
			<div class="text-lg text-gray-600">Memuat data...</div>
		</div>
	{:else if error}
		<div class="rounded-lg bg-red-50 p-4 text-red-700">
			{error}
		</div>
	{:else}
		<!-- Active Reservations Section -->
		<div class="mb-10">
			<h2 class="mb-4 text-xl font-bold text-gray-800">Reservasi Aktif</h2>

			{#if activeReservations.length === 0}
				<div class="rounded-lg border border-dashed border-gray-300 p-8 text-center">
					<p class="text-gray-500">Tidak ada reservasi aktif</p>
				</div>
			{:else}
				{#each activeReservations as reservation (reservation.reservationID)}
					<div class="mb-4 rounded-lg border border-gray-200 p-4">
						<div class="flex flex-wrap items-center justify-between">
							<div>
								<h3 class="font-semibold text-gray-800">
									#{reservation.invoice || reservation.reservationID}
								</h3>
								<p class="text-sm text-gray-600">
									{reservation.dateTime.date} | {reservation.dateTime.hour}
								</p>
								<p class="text-sm text-gray-600">Barber: {reservation.barber.name}</p>
								<p class="text-sm text-gray-600">Layanan: {reservation.service.name}</p>
							</div>
							<div class="mt-2 flex flex-wrap gap-2 sm:mt-0">
								<span
									class="rounded-full px-3 py-1 text-xs font-medium {getStatusColor(
										reservation.status
									)}"
								>
									{getStatusText(reservation.status)}
								</span>
							</div>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							{#if reservation.status === 'waiting'}
								<button
									class="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
									onclick={() => handleCancelReservation(reservation)}
									disabled={processingReservationId === reservation.reservationID}
								>
									{processingReservationId === reservation.reservationID
										? 'Memproses...'
										: 'Batalkan'}
								</button>
							{:else if reservation.status === 'onGoing'}
								<button
									class="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
									onclick={() => handleRescheduleReservation(reservation)}
									disabled={processingReservationId === reservation.reservationID}
								>
									{processingReservationId === reservation.reservationID
										? 'Memproses...'
										: 'Reschedule'}
								</button>
								<button
									class="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
									onclick={() => handleCancelReservation(reservation)}
									disabled={processingReservationId === reservation.reservationID}
								>
									{processingReservationId === reservation.reservationID
										? 'Memproses...'
										: 'Batalkan'}
								</button>
							{:else if reservation.status === 'requestToReschedule'}
								<button
									class="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
									onclick={() => handleCancelReservation(reservation)}
									disabled={processingReservationId === reservation.reservationID}
								>
									{processingReservationId === reservation.reservationID
										? 'Memproses...'
										: 'Batalkan'}
								</button>
							{:else if reservation.status === 'waitingForPayment'}
								<button
									class="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
									onclick={() => handlePayNow(reservation)}
									disabled={processingReservationId === reservation.reservationID}
								>
									{processingReservationId === reservation.reservationID
										? 'Memproses...'
										: 'Bayar Sekarang'}
								</button>
								<button
									class="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
									onclick={() => handleCancelReservation(reservation)}
									disabled={processingReservationId === reservation.reservationID}
								>
									{processingReservationId === reservation.reservationID
										? 'Memproses...'
										: 'Batalkan'}
								</button>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Reservation History Section -->
		<div>
			<h2 class="mb-4 text-xl font-bold text-gray-800">Riwayat Reservasi</h2>

			{#if historyReservations.length === 0}
				<div class="rounded-lg border border-dashed border-gray-300 p-8 text-center">
					<p class="text-gray-500">Tidak ada riwayat reservasi</p>
				</div>
			{:else}
				{#each historyReservations as reservation (reservation.reservationID)}
					<div class="mb-4 rounded-lg border border-gray-200 p-4">
						<div class="flex flex-wrap items-center justify-between">
							<div>
								<h3 class="font-semibold text-gray-800">
									#{reservation.invoice || reservation.reservationID}
								</h3>
								<p class="text-sm text-gray-600">
									{reservation.dateTime.date} | {reservation.dateTime.hour}
								</p>
								<p class="text-sm text-gray-600">Barber: {reservation.barber.name}</p>
								<p class="text-sm text-gray-600">Layanan: {reservation.service.name}</p>
							</div>
							<div class="mt-2 flex flex-wrap gap-2 sm:mt-0">
								<span
									class="rounded-full px-3 py-1 text-xs font-medium {getStatusColor(
										reservation.status
									)}"
								>
									{getStatusText(reservation.status)}
								</span>
							</div>
						</div>
						<div class="mt-3">
							<button
								class="text-sm text-blue-600 hover:underline"
								onclick={() => goto(`/profile/reservation/${reservation.reservationID}`)}
							>
								Lihat Detail
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}

	<!-- Cancel Reservation Dialog -->
	{#if showCancelDialog}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
				<div class="mb-4">
					<h3 class="text-lg font-semibold text-gray-900">Konfirmasi Pembatalan</h3>
					{#if showDownPaymentWarning}
						<div class="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
							<p>Peringatan: Pembayaran awal tidak dapat dikembalikan.</p>
						</div>
					{/if}
					<p class="mt-2 text-sm text-gray-600">
						Apakah Anda yakin ingin membatalkan reservasi ini?
					</p>
				</div>
				<div class="flex justify-end gap-3">
					<button
						class="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
						onclick={() => {
							showCancelDialog = false;
							reservationToCancel = null;
						}}
					>
						Batal
					</button>
					<button
						class="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
						onclick={confirmCancelReservation}
					>
						Konfirmasi Pembatalan
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
