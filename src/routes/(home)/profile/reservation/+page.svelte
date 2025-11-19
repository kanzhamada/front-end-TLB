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
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		Calendar,
		Clock,
		Scissors,
		User,
		X,
		RotateCcw,
		CreditCard,
		Eye,
		AlertCircle,
		MessageCircle
	} from 'lucide-svelte';

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

{#if loading}
	<div class="space-y-6">
		<Card class="border border-gray-200">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Calendar class="size-5" />
					<span>Reservasi Aktif</span>
				</CardTitle>
				<CardDescription>Memuat data reservasi Anda</CardDescription>
			</CardHeader>
			<CardContent>
				{#each [1, 2] as _}
					<div class="mb-4 rounded-lg border border-gray-200 p-4 last:mb-0">
						<div class="flex flex-wrap items-center justify-between">
							<div>
								<div class="h-4 w-32 rounded bg-gray-200"></div>
								<div class="mt-2 flex items-center gap-2">
									<Calendar class="size-4 text-gray-500" />
									<div class="h-3 w-24 rounded bg-gray-200"></div>
								</div>
								<div class="mt-1 flex items-center gap-2">
									<User class="size-4 text-gray-500" />
									<div class="h-3 w-24 rounded bg-gray-200"></div>
								</div>
								<div class="mt-1 flex items-center gap-2">
									<Scissors class="size-4 text-gray-500" />
									<div class="h-3 w-24 rounded bg-gray-200"></div>
								</div>
							</div>
							<div class="mt-2 flex flex-wrap gap-2 sm:mt-0">
								<div class="h-6 w-16 rounded-full bg-gray-200"></div>
							</div>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							<div class="h-8 w-24 rounded-md bg-gray-200"></div>
						</div>
					</div>
				{/each}
			</CardContent>
		</Card>
	</div>
{:else if error}
	<div class="space-y-6">
		<Card class="border border-gray-200">
			<CardContent class="pt-6">
				<div class="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
					<AlertCircle class="size-5" />
					<span>{error}</span>
				</div>
			</CardContent>
		</Card>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Active Reservations Section -->
		<Card class="border border-gray-200">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Calendar class="size-5" />
					<span>Reservasi Aktif</span>
				</CardTitle>
				<CardDescription>Reservasi yang sedang dalam proses</CardDescription>
			</CardHeader>
			<CardContent>
				{#if activeReservations.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<div class="mb-4 rounded-full bg-[#e8ddd4] p-4">
							<Calendar class="size-8 text-[#2e6057]" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Tidak ada reservasi aktif</h3>
						<p class="text-sm text-gray-500">Anda belum memiliki reservasi aktif saat ini</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each activeReservations as reservation (reservation.reservationID)}
							<div class="rounded-lg border border-gray-200 p-5 hover:bg-gray-50">
								<div class="flex flex-wrap items-center justify-between">
									<div>
										<h3 class="flex items-center gap-2 font-semibold text-gray-800">
											<Scissors class="size-4 text-[#2e6057]" />
											#{reservation.invoice || reservation.reservationID}
										</h3>
										<div class="mt-2 space-y-1">
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<Calendar class="size-4" />
												<span>{reservation.dateTime.date}</span>
											</div>
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<Clock class="size-4" />
												<span>{reservation.dateTime.hour}</span>
											</div>
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<User class="size-4" />
												<span>Barber: {reservation.barber.name}</span>
											</div>
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<Scissors class="size-4" />
												<span>Layanan: {reservation.service.name}</span>
											</div>
										</div>
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
								<div class="mt-4 flex flex-wrap gap-2">
									{#if reservation.status === 'waiting'}
										<Button
											variant="outline"
											class="border-red-500 text-red-500 hover:bg-red-50"
											onclick={() => handleCancelReservation(reservation)}
											disabled={processingReservationId === reservation.reservationID}
										>
											{#if processingReservationId === reservation.reservationID}
												<Skeleton class="h-4 w-16" />
											{:else}
												<X class="mr-2 size-4" />
												Batalkan
											{/if}
										</Button>
										<Button
											variant="outline"
											class="border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
											onclick={() => alert('Fitur chat akan segera tersedia')}
										>
											<MessageCircle class="mr-2 size-4" />
											Chat
										</Button>
									{:else if reservation.status === 'onGoing'}
										<Button
											variant="outline"
											class="border-blue-500 text-blue-500 hover:bg-blue-50"
											onclick={() => handleRescheduleReservation(reservation)}
											disabled={processingReservationId === reservation.reservationID}
										>
											{#if processingReservationId === reservation.reservationID}
												<Skeleton class="h-4 w-20" />
											{:else}
												<RotateCcw class="mr-2 size-4" />
												Reschedule
											{/if}
										</Button>
										<Button
											variant="outline"
											class="border-red-500 text-red-500 hover:bg-red-50"
											onclick={() => handleCancelReservation(reservation)}
											disabled={processingReservationId === reservation.reservationID}
										>
											{#if processingReservationId === reservation.reservationID}
												<Skeleton class="h-4 w-16" />
											{:else}
												<X class="mr-2 size-4" />
												Batalkan
											{/if}
										</Button>
										<Button
											variant="outline"
											class="border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
											onclick={() => alert('Fitur chat akan segera tersedia')}
										>
											<MessageCircle class="mr-2 size-4" />
											Chat
										</Button>
									{:else if reservation.status === 'requestToReschedule'}
										<Button
											variant="outline"
											class="border-red-500 text-red-500 hover:bg-red-50"
											onclick={() => handleCancelReservation(reservation)}
											disabled={processingReservationId === reservation.reservationID}
										>
											{#if processingReservationId === reservation.reservationID}
												<Skeleton class="h-4 w-16" />
											{:else}
												<X class="mr-2 size-4" />
												Batalkan
											{/if}
										</Button>
										<Button
											variant="outline"
											class="border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
											onclick={() => alert('Fitur chat akan segera tersedia')}
										>
											<MessageCircle class="mr-2 size-4" />
											Chat
										</Button>
									{:else if reservation.status === 'waitingForPayment'}
										<Button
											class="bg-green-500 text-white hover:bg-green-600"
											onclick={() => handlePayNow(reservation)}
											disabled={processingReservationId === reservation.reservationID}
										>
											{#if processingReservationId === reservation.reservationID}
												<Skeleton class="h-4 w-20" />
											{:else}
												<CreditCard class="mr-2 size-4" />
												Bayar Sekarang
											{/if}
										</Button>
										<Button
											variant="outline"
											class="border-red-500 text-red-500 hover:bg-red-50"
											onclick={() => handleCancelReservation(reservation)}
											disabled={processingReservationId === reservation.reservationID}
										>
											{#if processingReservationId === reservation.reservationID}
												<Skeleton class="h-4 w-16" />
											{:else}
												<X class="mr-2 size-4" />
												Batalkan
											{/if}
										</Button>
										<Button
											variant="outline"
											class="border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
											onclick={() => alert('Fitur chat akan segera tersedia')}
										>
											<MessageCircle class="mr-2 size-4" />
											Chat
										</Button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Reservation History Section -->
		<Card class="border border-gray-200">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Calendar class="size-5" />
					<span>Riwayat Reservasi</span>
				</CardTitle>
				<CardDescription>Reservasi yang telah selesai atau dibatalkan</CardDescription>
			</CardHeader>
			<CardContent>
				{#if historyReservations.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<div class="mb-4 rounded-full bg-[#e8ddd4] p-4">
							<Calendar class="size-8 text-[#2e6057]" />
						</div>
						<h3 class="mb-2 text-lg font-semibold">Tidak ada riwayat reservasi</h3>
						<p class="text-sm text-gray-500">Anda belum memiliki riwayat reservasi</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each historyReservations as reservation (reservation.reservationID)}
							<div class="rounded-lg border border-gray-200 p-5 hover:bg-gray-50">
								<div class="flex flex-wrap items-center justify-between">
									<div>
										<h3 class="flex items-center gap-2 font-semibold text-gray-800">
											<Scissors class="size-4 text-[#2e6057]" />
											#{reservation.invoice || reservation.reservationID}
										</h3>
										<div class="mt-2 space-y-1">
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<Calendar class="size-4" />
												<span>{reservation.dateTime.date}</span>
											</div>
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<Clock class="size-4" />
												<span>{reservation.dateTime.hour}</span>
											</div>
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<User class="size-4" />
												<span>Barber: {reservation.barber.name}</span>
											</div>
											<div class="flex items-center gap-2 text-sm text-gray-600">
												<Scissors class="size-4" />
												<span>Layanan: {reservation.service.name}</span>
											</div>
										</div>
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
								<div class="mt-4">
									<Button
										variant="outline"
										class="border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
										onclick={() => goto(`/profile/reservation/${reservation.reservationID}`)}
									>
										<Eye class="mr-2 size-4" />
										Lihat Detail
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
{/if}

<!-- Cancel Reservation Dialog -->
<AlertDialog open={showCancelDialog}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Konfirmasi Pembatalan</AlertDialogTitle>
			<AlertDialogDescription>
				{#if showDownPaymentWarning}
					<div class="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
						<p>Peringatan: Pembayaran awal tidak dapat dikembalikan.</p>
					</div>
				{/if}
				Apakah Anda yakin ingin membatalkan reservasi ini?
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel
				onclick={() => {
					showCancelDialog = false;
					reservationToCancel = null;
				}}
			>
				Batal
			</AlertDialogCancel>
			<AlertDialogAction class="bg-red-600 hover:bg-red-700" onclick={confirmCancelReservation}>
				Konfirmasi Pembatalan
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
