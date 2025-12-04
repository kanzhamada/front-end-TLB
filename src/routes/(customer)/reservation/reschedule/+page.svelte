<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import ReservationSheet from '$lib/components/User/Reservation/ReservationSheet.svelte';
	import { getReservationDetails, type ReservationResponse } from '$lib/api/customer/reservation';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		Calendar,
		Clock,
		Scissors,
		User,
		RotateCcw,
		FileText,
		AlertCircle,
		Sparkles
	} from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

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

	function getStatusText(status: string): string {
		switch (status) {
			case 'waiting':
				return 'Waiting';
			case 'onGoing':
				return 'On Going';
			case 'waitingForPayment':
				return 'Waiting Payment';
			case 'completed':
				return 'Completed';
			case 'canceledByUser':
				return 'Canceled by User';
			case 'canceledByAdmin':
				return 'Canceled by Admin';
			case 'declined':
				return 'Declined';
			case 'expired':
				return 'Expired';
			case 'requestToReschedule':
				return 'Reschedule Request';
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
</script>

<div class="relative container mx-auto my-20 min-h-screen p-4 md:p-8">
	{#if loading}
		<div class="space-y-8">
			<div class="flex items-center gap-4">
				<div class="rounded-xl border border-white/10 bg-white/5 p-3">
					<RotateCcw class="size-8 text-senary" />
				</div>
				<div>
					<div class="h-8 w-48 animate-pulse rounded bg-white/10"></div>
					<div class="mt-2 h-4 w-64 animate-pulse rounded bg-white/10"></div>
				</div>
			</div>

			<div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div class="space-y-3">
						<div class="h-6 w-32 animate-pulse rounded bg-white/10"></div>
						<div class="h-4 w-48 animate-pulse rounded bg-white/10"></div>
						<div class="h-4 w-40 animate-pulse rounded bg-white/10"></div>
					</div>
				</div>
				<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					{#each [1, 2, 3, 4, 5, 6] as _}
						<div class="h-16 animate-pulse rounded-lg bg-white/5"></div>
					{/each}
				</div>
			</div>
		</div>
	{:else if error}
		<div class="space-y-6">
			<div class="flex items-center gap-4">
				<div class="rounded-xl border border-white/10 bg-white/5 p-3">
					<RotateCcw class="size-8 text-senary" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-secondary">Reschedule Reservasi</h1>
					<p class="text-secondary/60">Ubah tanggal dan waktu reservasi Anda</p>
				</div>
			</div>

			<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
				<div class="flex flex-col items-center justify-center gap-4">
					<AlertCircle class="size-12" />
					<p class="text-lg font-medium">{error}</p>
					<Button
						variant="outline"
						class="border-red-500/30 text-red-400 hover:bg-red-500/10"
						onclick={() => goto('/profile/reservation')}
					>
						Kembali ke Daftar Reservasi
					</Button>
				</div>
			</div>
		</div>
	{:else if reservation}
		<div class="space-y-8" in:fade>
			<div class="flex items-center gap-4">
				<div class="rounded-xl border border-white/10 bg-white/5 p-3">
					<RotateCcw class="size-8 text-senary" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-secondary">Reschedule Reservasi</h1>
					<p class="text-secondary/60">Ubah tanggal dan waktu reservasi Anda</p>
				</div>
			</div>

			<div
				class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-senary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20"
				in:fly={{ y: 20, duration: 400 }}
			>
				<div
					class="absolute -top-10 -right-10 size-40 rounded-full bg-senary/5 blur-3xl transition-all group-hover:bg-senary/10"
				></div>

				<div class="relative z-10">
					<div class="mb-6 flex items-start justify-between">
						<div>
							<h3 class="flex items-center gap-2 text-lg font-bold text-secondary">
								<Scissors class="size-5 text-senary" />
								#{reservation.invoice || reservation.reservationID}
							</h3>
							<span
								class="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md {getStatusColor(
									reservation.status
								)}"
							>
								{getStatusText(reservation.status)}
							</span>
						</div>
						<div class="rounded-lg bg-senary/10 p-2">
							<Sparkles class="size-5 text-senary" />
						</div>
					</div>

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
						<div class="space-y-1">
							<p class="flex items-center gap-2 text-sm text-secondary/60">
								<Calendar class="size-4" />
								Tanggal
							</p>
							<p class="font-medium text-secondary">{reservation.dateTime.date}</p>
						</div>
						<div class="space-y-1">
							<p class="flex items-center gap-2 text-sm text-secondary/60">
								<Clock class="size-4" />
								Waktu
							</p>
							<p class="font-medium text-secondary">{reservation.dateTime.hour}</p>
						</div>
						<div class="space-y-1">
							<p class="flex items-center gap-2 text-sm text-secondary/60">
								<User class="size-4" />
								Barber
							</p>
							<p class="font-medium text-secondary">{reservation.barber.name}</p>
						</div>
						<div class="space-y-1">
							<p class="flex items-center gap-2 text-sm text-secondary/60">
								<Scissors class="size-4" />
								Layanan
							</p>
							<p class="font-medium text-secondary">{reservation.service.name}</p>
						</div>
						<div class="space-y-1">
							<p class="flex items-center gap-2 text-sm text-secondary/60">
								<FileText class="size-4" />
								Invoice
							</p>
							<p class="font-medium text-secondary">
								#{reservation.invoice || reservation.reservationID}
							</p>
						</div>
					</div>

					<div class="mt-8 flex justify-end">
						<ReservationSheet
							triggerClass="bg-senary text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-senary/90"
							triggerText="Reschedule Reservasi"
							reservationToReschedule={reservation}
							on:reservationCompleted={handleRescheduleCompleted}
						/>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm"
		>
			<div class="mb-4 rounded-full bg-white/5 p-4 shadow-inner">
				<RotateCcw class="size-8 text-secondary/40" />
			</div>
			<h3 class="mb-2 text-lg font-semibold text-secondary">Reservasi tidak ditemukan</h3>
			<p class="text-sm text-secondary/50">
				Kami tidak dapat menemukan data reservasi yang Anda cari.
			</p>
			<div class="mt-6">
				<Button
					variant="outline"
					class="border-senary/30 text-senary hover:border-senary/50 hover:bg-senary/10"
					onclick={() => goto('/profile/reservation')}
				>
					Kembali ke Daftar Reservasi
				</Button>
			</div>
		</div>
	{/if}
</div>
