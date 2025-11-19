<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { getReservationDetails, type ReservationResponse } from '$lib/api/customer/reservation';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let { params } = $props();
	let reservation: ReservationResponse | null = $state(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		await loadReservation();
	});

	async function loadReservation() {
		loading = true;
		error = null;

		try {
			const token = get(authStore).session?.access_token;
			if (!token) {
				throw new Error('User not authenticated');
			}

			const response = await getReservationDetails(params.id, token);
			if (!response.success) {
				throw new Error(response.message || 'Failed to load reservation details');
			}

			if (response.data && response.data.length > 0) {
				// The API returns an array, so we take the first item
				reservation = response.data[0];
			} else {
				throw new Error('Reservation not found');
			}
		} catch (err) {
			console.error('Error loading reservation details:', err);
			error =
				err instanceof Error ? err.message : 'An error occurred while loading reservation details';
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

	// Format currency in Indonesian Rupiah
	const currencyFormatter = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	});
</script>

<div class="space-y-6">
	<!-- Mini Navigation for Profile Sections - Now handled in layout -->

	<div class="mx-auto max-w-2xl">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Detail Reservasi</CardTitle>
					<CardDescription>Informasi lengkap tentang reservasi Anda</CardDescription>
				</div>
				<Button
					variant="outline"
					class="border-[#2e6057] text-[#2e6057] hover:bg-[#2e6057]/10"
					onclick={() => goto('/profile/reservation')}
				>
					Kembali
				</Button>
			</CardHeader>
			<CardContent>
				{#if loading}
					<div class="space-y-4">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-8 w-1/2" />
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-1/3" />
					</div>
				{:else if error}
					<div class="rounded-lg bg-red-50 p-4 text-red-700">
						{error}
					</div>
				{:else if reservation}
					<!-- Reservation Summary Section -->
					<div
						class="mb-6 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-500 p-5 text-white"
					>
						<div class="space-y-2">
							<div class="flex justify-between">
								<span>ID Invoice:</span>
								<span class="font-medium">#{reservation.invoice || reservation.reservationID}</span>
							</div>
							<div class="flex justify-between">
								<span>Tanggal:</span>
								<span class="font-medium">{reservation.dateTime.date}</span>
							</div>
							<div class="flex justify-between">
								<span>Waktu:</span>
								<span class="font-medium">{reservation.dateTime.hour}</span>
							</div>
							<div class="flex justify-between">
								<span>Barber:</span>
								<span class="font-medium">{reservation.barber.name}</span>
							</div>
							<div class="flex justify-between">
								<span>Layanan:</span>
								<span class="font-medium">{reservation.service.name}</span>
							</div>
							<div class="flex justify-between">
								<span>Status:</span>
								<span
									class="rounded-full px-3 py-1 text-xs font-medium {getStatusColor(
										reservation.status
									)} text-black"
								>
									{getStatusText(reservation.status)}
								</span>
							</div>
						</div>
					</div>

					<!-- Service Details -->
					<div class="mb-6">
						<h3 class="mb-3 text-lg font-semibold text-gray-800">Detail Layanan</h3>
						<div class="space-y-2">
							<div class="flex justify-between">
								<span class="text-gray-600">Layanan:</span>
								<span class="font-medium text-gray-900">{reservation.service.name}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-600">Harga:</span>
								<span class="font-medium text-gray-900">
									{reservation.service.price
										? currencyFormatter.format(reservation.service.price)
										: 'TBD'}
								</span>
							</div>
							{#if reservation.notes}
								<div class="mt-3">
									<div class="text-gray-600">Catatan:</div>
									<p class="text-gray-900">{reservation.notes}</p>
								</div>
							{/if}
						</div>
					</div>

					<Separator class="my-6" />

					<!-- Pricing Breakdown -->
					<div class="mb-6">
						<h3 class="mb-3 text-lg font-bold text-gray-900">Rincian Pembayaran</h3>
						<div class="space-y-3">
							<div class="flex justify-between">
								<span>{reservation.service.name}</span>
								<span
									>{reservation.service.price
										? currencyFormatter.format(reservation.service.price)
										: 'TBD'}</span
								>
							</div>
							{#if reservation.voucherId}
								<div class="flex justify-between text-[#2E6057]">
									<span>Diskon Voucher</span>
									<span>-{currencyFormatter.format(10000)}</span>
									<!-- Placeholder discount -->
								</div>
							{/if}
							<div class="flex justify-between text-rose-500">
								<span>Biaya Admin</span>
								<span>+{currencyFormatter.format(5000)}</span>
							</div>
							<Separator class="my-3" />
							<div class="flex justify-between font-bold">
								<span>Total Pembayaran</span>
								<span>
									{reservation.service.price
										? currencyFormatter.format(
												Math.max(
													reservation.service.price - (reservation.voucherId ? 10000 : 0) + 5000,
													0
												)
											)
										: currencyFormatter.format(5000)}
								</span>
							</div>
						</div>
					</div>

					<Separator class="my-6" />

					<!-- Contact Information -->
					{#if reservation.barber.phoneNumber}
						<div>
							<h3 class="mb-3 text-lg font-semibold text-gray-800">Kontak Barber</h3>
							<div class="flex justify-between">
								<span class="text-gray-600">Nomor Telepon:</span>
								<span class="font-medium text-gray-900">{reservation.barber.phoneNumber}</span>
							</div>
						</div>
					{/if}
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
