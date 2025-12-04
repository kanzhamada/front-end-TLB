<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import ReservationSheet from '$lib/components/User/Reservation/ReservationSheet.svelte';
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
		MessageCircle,
		Sparkles,
		History
	} from 'lucide-svelte';
	import CustomerChatModal from '$lib/components/User/Chat/CustomerChatModal.svelte';
	import { fade, fly } from 'svelte/transition';
	import Countdown from '$lib/components/User/Reservation/Countdown.svelte';
	import * as Pagination from '$lib/components/ui/pagination';
	import { toast } from 'svelte-sonner';

	let reservations: ReservationResponse[] = $state([]);
	let activeReservations: ReservationResponse[] = $state([]);
	let historyReservations: ReservationResponse[] = $state([]);
	let historyPage = $state(1);
	let historyItemsPerPage = 5;
	let paginatedHistoryReservations = $derived(
		historyReservations.slice(
			(historyPage - 1) * historyItemsPerPage,
			historyPage * historyItemsPerPage
		)
	);
	let loading = $state(true);
	let error = $state<string | null>(null);
	$effect(() => {
		if (error) {
			toast.error(error);
			goto('/auth/login');
			error = null;
		}
	});

	let showChatModal = $state(false);
	let selectedReservation: any = $state(null);

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

	// Function to open chat modal
	function openChatModal(reservation: any) {
		selectedReservation = reservation;
		showChatModal = true;
	}
</script>

{#if loading}
	<div class="space-y-10" in:fade>
		<!-- Active Reservations Skeleton -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="h-12 w-12 animate-pulse rounded-lg bg-white/10"></div>
				<div class="h-6 w-48 animate-pulse rounded bg-white/10"></div>
			</div>

			<div class="space-y-4">
				{#each [1, 2] as _}
					<div
						class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
					>
						<div class="flex flex-wrap items-start justify-between gap-4">
							<div class="space-y-4">
								<div>
									<div class="mb-2 h-4 w-48 animate-pulse rounded bg-white/10"></div>
									<div class="flex items-center gap-2">
										<div class="h-6 w-6 animate-pulse rounded bg-white/10"></div>
										<div class="h-6 w-32 animate-pulse rounded bg-white/10"></div>
									</div>
									<div class="mt-2 h-6 w-24 animate-pulse rounded-full bg-white/10"></div>
								</div>

								<div class="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
									{#each [1, 2, 3, 4] as _}
										<div class="flex items-center gap-2">
											<div class="h-4 w-4 animate-pulse rounded bg-white/10"></div>
											<div class="h-4 w-32 animate-pulse rounded bg-white/10"></div>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<div class="mt-4 flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
							<div class="h-10 w-24 animate-pulse rounded-lg bg-white/10"></div>
							<div class="h-10 w-24 animate-pulse rounded-lg bg-white/10"></div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- History Skeleton -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="h-10 w-10 animate-pulse rounded-lg bg-white/10"></div>
				<div class="h-6 w-32 animate-pulse rounded bg-white/10"></div>
			</div>

			<div class="space-y-4">
				{#each [1, 2, 3] as _}
					<div class="rounded-2xl border border-white/5 bg-white/5 p-6">
						<div class="flex flex-wrap items-center justify-between gap-4">
							<div class="space-y-4">
								<div>
									<div class="mb-2 h-4 w-48 animate-pulse rounded bg-white/10"></div>
									<div class="flex items-center gap-2">
										<div class="h-5 w-5 animate-pulse rounded bg-white/10"></div>
										<div class="h-5 w-24 animate-pulse rounded bg-white/10"></div>
									</div>
									<div class="mt-2 h-5 w-20 animate-pulse rounded-full bg-white/10"></div>
								</div>

								<div class="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
									{#each [1, 2, 3, 4] as _}
										<div class="flex items-center gap-2">
											<div class="h-3 w-3 animate-pulse rounded bg-white/10"></div>
											<div class="h-3 w-24 animate-pulse rounded bg-white/10"></div>
										</div>
									{/each}
								</div>
							</div>

							<div>
								<div class="h-9 w-24 animate-pulse rounded-lg bg-white/10"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
{:else if error}
	<div class="space-y-6">
		<div class="flex items-center gap-4">
			<div class="rounded-xl border border-white/10 bg-white/5 p-3">
				<Calendar class="size-8 text-senary" />
			</div>
			<div>
				<h2 class="text-2xl font-bold text-secondary">Reservations</h2>
				<p class="text-secondary/60">Manage your appointments</p>
			</div>
		</div>

		<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
			<div class="flex items-center justify-center gap-2">
				<AlertCircle class="size-5" />
				<span>{error} tes</span>
			</div>
		</div>
	</div>
{:else}
	<div class="space-y-10" in:fade>
		<!-- Active Reservations Section -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-senary/10 p-2">
					<Calendar class="size-8 text-senary" />
				</div>
				<h3 class="text-xl font-bold text-secondary">Active Reservations</h3>
			</div>

			{#if activeReservations.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm"
				>
					<div class="mb-4 rounded-full bg-white/5 p-4 shadow-inner">
						<Calendar class="size-8 text-secondary/40" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-secondary">No active reservations</h3>
					<p class="text-sm text-secondary/50">You don't have any upcoming appointments.</p>

					<ReservationSheet
						triggerClass="mt-6 bg-senary text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-senary/90"
						triggerText="Reservasi Sekarang"
					/>
				</div>
			{:else}
				<div class="space-y-4">
					{#each activeReservations as reservation (reservation.reservationID)}
						<div
							class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-senary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20"
							in:fly={{ y: 20, duration: 400 }}
						>
							<div
								class="absolute -top-10 -right-10 size-40 rounded-full bg-senary/5 blur-3xl transition-all group-hover:bg-senary/10"
							></div>

							<div class="relative z-10 flex flex-wrap items-start justify-between gap-4">
								<div class="space-y-4">
									<div>
										<p class="text-sm font-medium text-secondary/70">
											Pesanan Dibuat pada: {new Date(reservation.created_at)
												.toLocaleString('id-ID', {
													year: 'numeric',
													month: 'numeric',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})
												.replace(/\//g, '-')}
										</p>
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

									<div class="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
										<div class="flex items-center gap-2 text-sm text-secondary/70">
											<Calendar class="size-4 text-senary/70" />
											<span>{reservation.dateTime.date}</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/70">
											<Clock class="size-4 text-senary/70" />
											<span>{reservation.dateTime.hour}</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/70">
											<User class="size-4 text-senary/70" />
											<span>Barber: {reservation.barber.name}</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/70">
											<Scissors class="size-4 text-senary/70" />
											<span>Service: {reservation.service.name}</span>
										</div>
									</div>

									{#if reservation.status === 'waitingForPayment'}
										<div
											class="mt-4 mb-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4"
										>
											<div class="mb-2 flex items-center gap-2 text-orange-300">
												<Clock class="size-4 animate-pulse" />
												<span class="text-sm font-medium">Payment Deadline</span>
											</div>
											<Countdown
												date={reservation.updated_at ||
													reservation.created_at ||
													new Date().toISOString()}
												onExpire={() => {
													reservation.status = 'expired';
												}}
											/>
											<p class="mt-2 text-xs text-orange-300/70">
												Please complete payment before the timer expires to avoid automatic
												cancellation.
											</p>
										</div>
									{/if}
								</div>
							</div>

							<div class="mt-4 flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
								{#if reservation.status === 'waiting'}
									<Button
										variant="outline"
										class="border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
										onclick={() => handleCancelReservation(reservation)}
										disabled={processingReservationId === reservation.reservationID}
									>
										{#if processingReservationId === reservation.reservationID}
											<Skeleton class="h-4 w-16 bg-white/10" />
										{:else}
											<X class="mr-2 size-4" />
											Cancel
										{/if}
									</Button>
									<Button
										variant="outline"
										class="border-senary/30 text-senary transition-all duration-300 hover:border-senary hover:bg-senary/10 hover:text-senary"
										onclick={() => openChatModal(reservation)}
									>
										<MessageCircle class="mr-2 size-4" />
										Chat
									</Button>
								{:else if reservation.status === 'onGoing'}
									<Button
										variant="outline"
										class="border-quaternary/30 text-quaternary transition-all duration-300 hover:border-quaternary hover:bg-quaternary/10 hover:text-quaternary"
										onclick={() => handleRescheduleReservation(reservation)}
										disabled={processingReservationId === reservation.reservationID}
									>
										{#if processingReservationId === reservation.reservationID}
											<Skeleton class="h-4 w-20 bg-white/10" />
										{:else}
											<RotateCcw class="mr-2 size-4" />
											Reschedule
										{/if}
									</Button>
									<Button
										variant="outline"
										class="border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
										onclick={() => handleCancelReservation(reservation)}
										disabled={processingReservationId === reservation.reservationID}
									>
										{#if processingReservationId === reservation.reservationID}
											<Skeleton class="h-4 w-16 bg-white/10" />
										{:else}
											<X class="mr-2 size-4" />
											Cancel
										{/if}
									</Button>
									<Button
										variant="outline"
										class="border-senary/30 text-senary transition-all duration-300 hover:border-senary hover:bg-senary/10 hover:text-senary"
										onclick={() => openChatModal(reservation)}
									>
										<MessageCircle class="mr-2 size-4" />
										Chat
									</Button>
								{:else if reservation.status === 'requestToReschedule'}
									<Button
										variant="outline"
										class="border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
										onclick={() => handleCancelReservation(reservation)}
										disabled={processingReservationId === reservation.reservationID}
									>
										{#if processingReservationId === reservation.reservationID}
											<Skeleton class="h-4 w-16 bg-white/10" />
										{:else}
											<X class="mr-2 size-4" />
											Cancel
										{/if}
									</Button>
									<Button
										variant="outline"
										class="border-senary/30 text-senary transition-all duration-300 hover:border-senary hover:bg-senary/10 hover:text-senary"
										onclick={() => openChatModal(reservation)}
									>
										<MessageCircle class="mr-2 size-4" />
										Chat
									</Button>
								{:else if reservation.status === 'waitingForPayment'}
									<Button
										class="bg-senary text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 hover:bg-senary/90 hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
										onclick={() => handlePayNow(reservation)}
										disabled={processingReservationId === reservation.reservationID}
									>
										{#if processingReservationId === reservation.reservationID}
											<Skeleton class="h-4 w-20 bg-white/20" />
										{:else}
											<CreditCard class="mr-2 size-4" />
											Pay Now
										{/if}
									</Button>
									<Button
										variant="outline"
										class="border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
										onclick={() => handleCancelReservation(reservation)}
										disabled={processingReservationId === reservation.reservationID}
									>
										{#if processingReservationId === reservation.reservationID}
											<Skeleton class="h-4 w-16 bg-white/10" />
										{:else}
											<X class="mr-2 size-4" />
											Cancel
										{/if}
									</Button>
									<Button
										variant="outline"
										class="border-senary/30 text-senary transition-all duration-300 hover:border-senary hover:bg-senary/10 hover:text-senary"
										onclick={() => openChatModal(reservation)}
									>
										<MessageCircle class="mr-2 size-4" />
										Chat
									</Button>
								{/if}
								<Button
									variant="outline"
									class="border-senary/20 text-secondary/70 transition-all duration-300 hover:border-senary/50 hover:bg-senary/5 hover:text-senary"
									onclick={() => goto(`/profile/reservation/${reservation.reservationID}`)}
								>
									<Eye class="mr-2 size-4" />
									Details
								</Button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Reservation History Section -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-white/5 p-2">
					<History class="size-5 text-secondary/70" />
				</div>
				<h3 class="text-xl font-bold text-secondary">History</h3>
			</div>

			{#if historyReservations.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm"
				>
					<div class="mb-4 rounded-full bg-white/5 p-4 shadow-inner">
						<History class="size-8 text-secondary/40" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-secondary">No history found</h3>
					<p class="text-sm text-secondary/50">You don't have any past reservations.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each paginatedHistoryReservations as reservation (reservation.reservationID)}
						<div
							class="group rounded-2xl border border-white/5 bg-white/5 p-6 transition-all hover:border-white/10 hover:bg-white/10"
						>
							<div class="flex flex-wrap items-center justify-between gap-4">
								<div class="space-y-4">
									<div>
										<p class="text-sm font-medium text-secondary/70">
											Pesanan Dibuat pada: {new Date(reservation.created_at)
												.toLocaleString('id-ID', {
													year: 'numeric',
													month: 'numeric',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})
												.replace(/\//g, '-')}
										</p>
										<h3 class="flex items-center gap-2 font-semibold text-secondary/80">
											<Scissors class="size-4 text-senary/50" />
											#{reservation.invoice || reservation.reservationID}
										</h3>
										<span
											class="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium {getStatusColor(
												reservation.status
											)}"
										>
											{getStatusText(reservation.status)}
										</span>
									</div>

									<div class="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
										<div class="flex items-center gap-2 text-sm text-secondary/60">
											<Calendar class="size-3" />
											<span>{reservation.dateTime.date}</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/60">
											<Clock class="size-3" />
											<span>{reservation.dateTime.hour}</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/60">
											<User class="size-3" />
											<span>Barber: {reservation.barber.name}</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/60">
											<Scissors class="size-3" />
											<span>Service: {reservation.service.name}</span>
										</div>
									</div>
								</div>

								<div>
									<Button
										variant="outline"
										class="border-white/10 text-secondary/70 hover:bg-white/10 hover:text-secondary"
										onclick={() => goto(`/profile/reservation/${reservation.reservationID}`)}
									>
										<Eye class="mr-2 size-4" />
										Details
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>

				{#if historyReservations.length > historyItemsPerPage}
					<div class="mt-8">
						<Pagination.Root
							count={historyReservations.length}
							perPage={historyItemsPerPage}
							bind:page={historyPage}
						>
							{#snippet children({ pages, currentPage })}
								<Pagination.Content>
									<Pagination.Item>
										<Pagination.PrevButton />
									</Pagination.Item>
									{#each pages as page (page.key)}
										{#if page.type === 'ellipsis'}
											<Pagination.Item>
												<Pagination.Ellipsis />
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link {page} isActive={currentPage === page.value}>
													{page.value}
												</Pagination.Link>
											</Pagination.Item>
										{/if}
									{/each}
									<Pagination.Item>
										<Pagination.NextButton />
									</Pagination.Item>
								</Pagination.Content>
							{/snippet}
						</Pagination.Root>
					</div>
				{/if}
			{/if}
		</section>
	</div>
	<CustomerChatModal
		reservation={selectedReservation}
		open={showChatModal}
		onClose={() => (showChatModal = false)}
	/>
{/if}
<!-- Customer Chat Modal -->

<!-- Cancel Reservation Dialog -->
<AlertDialog open={showCancelDialog}>
	<AlertDialogContent class="border border-white/10 bg-primary text-secondary">
		<AlertDialogHeader>
			<AlertDialogTitle class="text-white">Cancel Reservation?</AlertDialogTitle>
			<AlertDialogDescription class="text-secondary/70">
				{#if showDownPaymentWarning}
					<div
						class="mt-2 mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300"
					>
						<p>Warning: Down payment cannot be refunded.</p>
					</div>
				{/if}
				Are you sure you want to cancel this reservation? This action cannot be undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel
				class="border-white/10 bg-transparent text-secondary hover:bg-white/10 hover:text-white"
				onclick={() => {
					showCancelDialog = false;
					reservationToCancel = null;
				}}
			>
				No, Keep It
			</AlertDialogCancel>
			<AlertDialogAction
				class="bg-red-600 text-white hover:bg-red-700"
				onclick={confirmCancelReservation}
			>
				Yes, Cancel It
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
