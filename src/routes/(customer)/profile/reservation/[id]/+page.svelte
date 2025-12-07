<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import { getReservationDetails, type ReservationResponse } from '$lib/api/customer/reservation';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Calendar,
		Clock,
		Scissors,
		User,
		FileText,
		CreditCard,
		Phone,
		MapPin,
		ChevronLeft,
		Receipt
	} from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import Countdown from '$lib/components/User/Reservation/Countdown.svelte';

	let { params } = $props();
	let reservation: ReservationResponse | null = $state(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		await loadReservation();
	});

	async function reloadReservation() {
		await goto(`/profile/reservation`);
	}

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
				return 'Waiting';
			case 'onGoing':
				return 'Sedang Berjalan';
			case 'waitingForPayment':
				return 'Waiting Payment';
			case 'completed':
				return 'Completed';
			case 'canceledByUser':
				return 'Dibatalkan Pengguna';
			case 'canceledByAdmin':
				return 'Dibatalkan Admin';
			case 'declined':
				return 'Declined';
			case 'expired':
				return 'Expired';
			case 'requestToReschedule':
				return 'Permintaan Jadwal Ulang';
			default:
				return status;
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'waiting':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'onGoing':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
			case 'waitingForPayment':
				return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
			case 'completed':
				return 'bg-green-500/20 text-green-300 border-green-500/30';
			case 'canceledByUser':
			case 'canceledByAdmin':
			case 'declined':
			case 'expired':
				return 'bg-red-500/20 text-red-300 border-red-500/30';
			case 'requestToReschedule':
				return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
			default:
				return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
		}
	}

	function getFulfillmentStatusText(status: string): string {
		switch (status) {
			case 'pendingDownPayment':
				return 'Menunggu Uang Muka';
			case 'downPaymentPaid':
				return 'Uang Muka Dibayar';
			case 'fullyPaid':
				return 'Lunas';
			case 'refunded':
				return 'Dikembalikan';
			case 'failed':
				return 'Gagal';
			default:
				return status;
		}
	}

	const currencyFormatter = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	});
</script>

<svelte:head>
	<title>Profile - Reservation Details | Three Lights Barbershop</title>
</svelte:head>

<div class="space-y-10" in:fade>
	<!-- Header -->
	<div class="mb-6 flex items-center gap-3">
		<Button
			variant="ghost"
			size="icon"
			class="rounded-lg bg-senary/10 p-2 text-secondary hover:bg-white/10 hover:text-senary"
			onclick={() => goto('/profile/reservation')}
		>
			<ChevronLeft class="size-6" />
		</Button>
		<div>
			<h3 class="text-xl font-bold text-secondary">Detail Reservasi</h3>
			<p class="text-secondary/60">Lihat informasi lengkap tentang janji temu Anda</p>
		</div>
	</div>

	{#if loading}
		<div class="glass-panel space-y-8 rounded-2xl p-8">
			<div class="flex items-center justify-between">
				<Skeleton class="h-8 w-48 bg-white/10" />
				<Skeleton class="h-8 w-32 rounded-full bg-white/10" />
			</div>
			<div class="grid gap-8 md:grid-cols-2">
				<div class="space-y-4">
					<Skeleton class="h-6 w-32 bg-white/10" />
					<Skeleton class="h-4 w-full bg-white/10" />
					<Skeleton class="h-4 w-full bg-white/10" />
				</div>
				<div class="space-y-4">
					<Skeleton class="h-6 w-32 bg-white/10" />
					<Skeleton class="h-4 w-full bg-white/10" />
					<Skeleton class="h-4 w-full bg-white/10" />
				</div>
			</div>
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
			<p>{error}</p>
			<Button
				variant="outline"
				class="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
				onclick={reloadReservation}
			>
				Coba Lagi
			</Button>
		</div>
	{:else if reservation}
		<div class=" overflow-hidden rounded-2xl" in:fly={{ y: 20, duration: 500, delay: 100 }}>
			<!-- Status Banner -->
			<div class="px-8 py-6">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-senary/10 p-2">
							<Receipt class="size-5 text-senary" />
						</div>
						<div>
							<p class="text-sm text-secondary/60">ID Tagihan</p>
							<p class="font-mono text-lg font-bold text-secondary">
								#{reservation.invoice || reservation.reservationID}
							</p>
						</div>
					</div>
					<Badge
						variant="outline"
						class="{getStatusColor(reservation.status)} px-4 py-1.5 text-sm backdrop-blur-md"
					>
						{getStatusText(reservation.status)}
					</Badge>
				</div>
			</div>
			{#if reservation.status === 'waitingForPayment'}
				<div class="px-8 pb-6">
					<Countdown
						date={reservation.updated_at}
						onExpire={() => {
							if (reservation) reservation.status = 'expired';
						}}
					/>
				</div>
			{/if}

			<div class="p-8">
				<div class="grid gap-12 md:grid-cols-1">
					<!-- Left Column: Service Info -->
					<div class="space-y-8">
						<div>
							<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-senary">
								<Scissors class="size-5" />
								Informasi Layanan
							</h3>
							<div class="space-y-4 rounded-xl border border-white/5 bg-white/5 p-5">
								<div class="flex items-start justify-between gap-4">
									<div>
										<p class="font-medium text-secondary">{reservation.service.name}</p>
										<p class="text-sm text-secondary/60">Layanan Rambut Profesional</p>
									</div>
									<p class="font-bold text-senary">
										{reservation.service.price
											? currencyFormatter.format(reservation.service.price)
											: 'TBD'}
									</p>
								</div>
								{#if reservation.notes}
									<Separator class="bg-white/10" />
									<div>
										<p class="mb-1 text-xs font-medium tracking-wider text-secondary/40 uppercase">
											Catatan
										</p>
										<p class="text-sm text-secondary/80">{reservation.notes}</p>
									</div>
								{/if}
							</div>
						</div>

						<div>
							<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-senary">
								<User class="size-5" />
								Detail Barber
							</h3>
							<div class="rounded-xl border border-white/5 bg-white/5 p-5">
								<div class="flex items-center gap-4">
									<div
										class="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-senary/20 to-primary/20 text-senary"
									>
										<User class="size-6" />
									</div>
									<div>
										<p class="font-bold text-secondary">{reservation.barber.name}</p>
										<p class="text-sm text-secondary/60">Barber Profesional</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Right Column: Schedule & Payment -->
					<div class="space-y-8">
						<div>
							<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-senary">
								<Calendar class="size-5" />
								Jadwal
							</h3>
							<div class="space-y-3 rounded-xl border border-white/5 bg-white/5 p-5">
								<div class="flex items-center gap-3">
									<Calendar class="size-5 text-secondary/60" />
									<div>
										<p class="text-xs text-secondary/40">Tanggal</p>
										<p class="font-medium text-secondary">{reservation.dateTime.date}</p>
										{#if reservation.newDateTime?.date}
											<p class="text-xs text-secondary/40">Tanggal Baru (Jadwal Ulang)</p>
											<p class="font-medium text-secondary">{reservation.newDateTime?.date}</p>
										{/if}
									</div>
								</div>
								<Separator class="bg-white/10" />
								<div class="flex items-center gap-3">
									<Clock class="size-5 text-secondary/60" />
									<div>
										<p class="text-xs text-secondary/40">Waktu</p>
										<p class="font-medium text-secondary">{reservation.dateTime.hour}</p>
										{#if reservation.newDateTime?.hour}
											<p class="text-xs text-secondary/40">Waktu Baru (Jadwal Ulang)</p>
											<p class="font-medium text-secondary">{reservation.newDateTime?.hour}</p>
										{/if}
									</div>
								</div>
								<Separator class="bg-white/10" />
								<div class="flex items-center gap-3">
									<MapPin class="size-5 text-secondary/60" />
									<div>
										<p class="text-xs text-secondary/40">Lokasi</p>
										<p class="font-medium text-secondary">Three Lights Barbershop</p>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-senary">
								<CreditCard class="size-5" />
								Ringkasan Pembayaran
							</h3>
							<div class="space-y-3 rounded-xl border border-white/5 bg-white/5 p-5">
								<div class="flex justify-between text-sm">
									<span class="text-secondary/70">Harga Service</span>
									<span class="text-secondary">
										{reservation.service.price
											? currencyFormatter.format(reservation.service.price)
											: 'TBD'}
									</span>
								</div>
								{#if reservation.voucherValue}
									<div class="flex justify-between text-sm text-green-400">
										<span>Diskon Voucher</span>
										<span
											>- {reservation.voucherValue
												? currencyFormatter.format(reservation.voucherValue)
												: 'TBD'}</span
										>
									</div>
								{/if}
								<div class="flex justify-between text-sm text-secondary/70">
									<span>Biaya Admin</span>
									<span
										>+ {reservation.voucherValue
											? currencyFormatter.format(
													reservation.totalPayment +
														reservation.voucherValue -
														reservation.service.price
												)
											: currencyFormatter.format(
													reservation.totalPayment - reservation.service.price
												)}</span
									>
								</div>
								<Separator class="bg-white/10" />
								<div class="flex justify-between text-lg font-bold">
									<span class="text-senary">Total</span>
									<span class="text-secondary"
										>{reservation.totalPayment
											? currencyFormatter.format(reservation.totalPayment)
											: 'TBD'}</span
									>
								</div>
								<div class="flex justify-between text-lg font-bold">
									<span class="text-senary">Biaya DP</span>
									<span class="text-secondary"
										>{reservation.downPayment
											? currencyFormatter.format(reservation.downPayment)
											: 'TBD'}</span
									>
								</div>
								{#if reservation.fulfillmentStatus}
									<div class="flex justify-between text-sm text-secondary/70">
										<span>Status</span>
										<span class="font-medium text-secondary"
											>{getFulfillmentStatusText(reservation.fulfillmentStatus)}</span
										>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
