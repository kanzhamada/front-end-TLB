<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth';
	import ReservationSheet from '$lib/components/User/Reservation/ReservationSheet.svelte';
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription
	} from '$lib/components/ui/sheet';
	import {
		getReservations,
		type ReservationResponse,
		cancelReservation,
		createTransaction
	} from '$lib/api/customer/reservation';
	import { getMessagesByReservation } from '$lib/api/shared/chat';
	import { supabase } from '$lib/supabase/client';
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
		History,
		RefreshCw
	} from 'lucide-svelte';
// ... (keeping existing imports if needed, but replace_file_content works on chunks)

// I will do two edits. One for import, one for the header.
// Actually I can do it in one go if I use multi_replace_file_content or just separate calls.
// Let's use multi_replace_file_content for efficiency.

	import CustomerChatModal from '$lib/components/User/Chat/CustomerChatModal.svelte';
	import { fade, fly } from 'svelte/transition';
	import Countdown from '$lib/components/User/Reservation/Countdown.svelte';
	import * as Pagination from '$lib/components/ui/pagination';
	import { toast } from 'svelte-sonner';

	let reservations: ReservationResponse[] = $state([]);
	let activeReservations: ReservationResponse[] = $state([]);
	let historyReservations: ReservationResponse[] = $state([]);
	let unreadCounts: Record<string, number> = $state({});
	$effect(() => {
		console.log('unreadCounts', unreadCounts);
	});
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

	// Payment Sheet State
	let showPaymentSheet = $state(false);
	let paymentToken = $state<string | null>(null);
	let currentReservationForPayment = $state<ReservationResponse | null>(null);

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
			historyReservations = reservations
				.filter((res) => historyStatuses.includes(res.status))
				.sort((a, b) => {
					const dateA = new Date(a.updated_at || a.created_at).getTime();
					const dateB = new Date(b.updated_at || b.created_at).getTime();
					return dateB - dateA;
				});

			// Fetch unread counts for active reservations
			await fetchUnreadCounts(activeReservations, token);

			// Cleanup stale Midtrans sessions
			cleanupMidtransSessions(reservations);
		} catch (err) {
			console.error('Error loading reservations:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading reservations';
		} finally {
			loading = false;
		}
	}

	function cleanupMidtransSessions(currentReservations: ReservationResponse[]) {
		if (typeof window === 'undefined') return;

		const waitingForPaymentIds = new Set(
			currentReservations
				.filter((r) => r.status === 'waitingForPayment')
				.map((r) => r.reservationID)
		);

		// Iterate over all localStorage keys
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith('midtrans_token_')) {
				const reservationId = key.replace('midtrans_token_', '');
				
				// If the reservation is not in waitingForPayment status, remove the token
				if (!waitingForPaymentIds.has(reservationId)) {
					console.log(`Removing stale Midtrans token for reservation: ${reservationId}`);
					localStorage.removeItem(key);
					// Decrement i because removeItem shifts indices
					i--;
				}
			}
		}
	}

	async function fetchUnreadCounts(reservations: ReservationResponse[], token: string) {
		const currentUserId = await get(authStore).session?.user?.id;
		console.log('currentUserId', currentUserId);
		if (!currentUserId) {
			console.error('Cannot fetch unread counts: User ID is undefined');
			return;
		}
		console.log('Fetching unread counts for user:', currentUserId);

		for (const reservation of reservations) {
			try {
				// Try to get chat ID from chats table directly first
				let chatID: string | null = null;

				const { data: chatData, error: chatError } = await supabase
					.from('chats')
					.select('chatID')
					.eq('reservationID', reservation.reservationID)
					.single();

				if (!chatError && chatData) {
					chatID = chatData.chatID;
				} else {
					// Fallback to API if direct query fails (e.g. RLS or table structure diff)
					console.log('Chat ID not found in chats table, trying API for reservation:', reservation.reservationID);
					const chatResponse = await getMessagesByReservation(reservation.reservationID, token);
					if (chatResponse.success && chatResponse.data?.chatID) {
						chatID = chatResponse.data.chatID;
					}
				}

				if (chatID) {
					// Get unread count
					const { count, error } = await supabase
						.from('messages')
						.select('*', { count: 'exact', head: true })
						.eq('chatID', chatID)
						.eq('read', false)
						.neq('sender', currentUserId);

					if (!error) {
						console.log(`Unread count for reservation ${reservation.reservationID} (chat ${chatID}):`, count);
						// Use spread to ensure reactivity
						unreadCounts = {
							...unreadCounts,
							[reservation.reservationID]: count || 0
						};
					} else {
						console.error(`Error fetching unread count for chat ${chatID}:`, error);
					}
				} else {
					console.log('No chatID found for reservation:', reservation.reservationID);
				}
			} catch (err) {
				console.error(
					`Error fetching unread count for reservation ${reservation.reservationID}:`,
					err
				);
			}
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'waiting':
				return 'Menunggu';
			case 'onGoing':
				return 'Sedang Berjalan';
			case 'waitingForPayment':
				return 'Menunggu Pembayaran';
			case 'completed':
				return 'Selesai';
			case 'canceledByUser':
				return 'Dibatalkan Pengguna';
			case 'canceledByAdmin':
				return 'Dibatalkan Admin';
			case 'declined':
				return 'Ditolak';
			case 'expired':
				return 'Kedaluwarsa';
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

	// Reschedule Warning State
	let showRescheduleWarning = $state(false);
	let reservationToReschedule = $state<ReservationResponse | null>(null);

	async function handleRescheduleReservation(reservation: ReservationResponse) {
		reservationToReschedule = reservation;
		showRescheduleWarning = true;
	}

	async function confirmReschedule() {
		if (reservationToReschedule) {
			goto(`/reservation/reschedule?id=${reservationToReschedule.reservationID}`);
			showRescheduleWarning = false;
			reservationToReschedule = null;
		}
	}

	// async function handlePayNow(reservation: ReservationResponse) {
	// 	const token = get(authStore).session?.access_token;
	// 	console.log('Token:', token);
	// 	if (!token) {
	// 		error = 'User not authenticated';
	// 		return;
	// 	}

	// 	processingReservationId = reservation.reservationID;

	// 	try {
	// 		const response = await createTransaction(reservation.reservationID, token);
	// 		if (!response.success) {
	// 			throw new Error(response.message || 'Failed to create transaction');
	// 		}

	// 		// Use Midtrans Snap
	// 		if (response.data?.token) {
	// 			// @ts-ignore
	// 			window.snap.pay(response.data.token, {
	// 				onSuccess: function (result: any) {
	// 					console.log('Payment success:', result);
	// 					toast.success('Pembayaran berhasil!');
	// 					loadReservations();
	// 				},
	// 				onPending: function (result: any) {
	// 					console.log('Payment pending:', result);
	// 					toast.info('Menunggu pembayaran...');
	// 					loadReservations();
	// 				},
	// 				onError: function (result: any) {
	// 					console.error('Payment error:', result);
	// 					toast.error('Pembayaran gagal!');
	// 				},
	// 				onClose: function () {
	// 					console.log('Customer closed the popup without finishing the payment');
	// 					toast.info('Pembayaran belum diselesaikan.');
	// 				}
	// 			});
	// 		} else if (response.data?.redirect_url) {
	// 			// Fallback to redirect if no token (should not happen with new backend)
	// 			window.location.href = response.data.redirect_url;
	// 		}
	// 	} catch (err) {
	// 		console.error('Error creating transaction:', err);
	// 		error = err instanceof Error ? err.message : 'An error occurred while creating transaction';
	// 	} finally {
	// 		processingReservationId = null;
	// 	}
	// }

	// Function to open chat modal
	function openChatModal(reservation: any) {
		console.log('Opening chat modal for reservation:', reservation);
		console.log('Passing userId to chat modal:', get(authStore).session?.user?.id);
		selectedReservation = reservation;
		showChatModal = true;
		// Reset unread count when opening chat
		if (unreadCounts[reservation.reservationID]) {
			unreadCounts[reservation.reservationID] = 0;
		}
	}

	// Watch for sheet close to hide snap
	$effect(() => {
		if (!showPaymentSheet && typeof window !== 'undefined' && (window as any).snap) {
			try {
				(window as any).snap.hide();
			} catch (e) {
				console.error('Error hiding snap:', e);
			}
		}
	});

	async function handlePayNow(reservation: ReservationResponse) {
		const token = get(authStore).session?.access_token;
		if (!token) {
			error = 'User not authenticated';
			return;
		}

		processingReservationId = reservation.reservationID;
		currentReservationForPayment = reservation;

		try {
			// Check for existing token in localStorage
			const localStorageKey = `midtrans_token_${reservation.reservationID}`;
			const cachedToken = localStorage.getItem(localStorageKey);

			if (cachedToken) {
				console.log('Using cached token:', cachedToken);
				paymentToken = cachedToken;
			} else {
				// If no cached token, create new transaction
				const response = await createTransaction(reservation.reservationID, token);
				if (!response.success) {
					throw new Error(response.message || 'Failed to create transaction');
				}

				if (response.data?.token) {
					paymentToken = response.data.token;
					// Save token to localStorage
					localStorage.setItem(localStorageKey, paymentToken!);
				} else if (response.data?.redirect_url) {
					window.location.href = response.data.redirect_url;
					return;
				}
			}

			if (paymentToken) {
				showPaymentSheet = true;

				// Wait for Sheet to open and container to exist
				setTimeout(() => {
					// @ts-ignore
					if (window.snap) {
						// Ensure clean state by hiding first
						try {
							// @ts-ignore
							window.snap.hide();
						} catch (e) {
							console.log('Snap already hidden or not initialized');
						}

						// @ts-ignore
						window.snap.embed(paymentToken, {
							embedId: 'snap-container',
							onSuccess: function (result: any) {
								console.log('Payment success:', result);
								toast.success('Pembayaran berhasil!');
								showPaymentSheet = false;
								// Remove token from localStorage on success
								localStorage.removeItem(localStorageKey);
								loadReservations();
							},
							onPending: function (result: any) {
								console.log('Payment pending:', result);
								toast.info('Menunggu pembayaran...');
								showPaymentSheet = false;
								loadReservations();
							},
							onError: function (result: any) {
								console.error('Payment error:', result);
								toast.error('Pembayaran gagal!');
							},
							onClose: function () {
								console.log('Customer closed the popup without finishing the payment');
								toast.info('Pembayaran belum diselesaikan. Anda dapat melanjutkannya nanti.');
							}
						});
					}
				}, 100);
			}
		} catch (err) {
			console.error('Error creating transaction:', err);
			toast.error(err instanceof Error ? err.message : 'Gagal memproses pembayaran');
		} finally {
			processingReservationId = null;
		}
	}
</script>

<svelte:head>
	<title>Profile - Reservation | Three Lights Barbershop</title>
	<script
		src="https://app.sandbox.midtrans.com/snap/snap.js"
		data-client-key={import.meta.env.PUBLIC_MIDTRANS_CLIENT_KEY}
	></script>
</svelte:head>

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
				<h2 class="text-2xl font-bold text-secondary">Reservasi</h2>
				<p class="text-secondary/60">Kelola janji temu Anda</p>
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
		<!-- Header with Refresh -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				<div class="rounded-xl border border-white/10 bg-white/5 p-3">
					<Calendar class="size-8 text-senary" />
				</div>
				<div>
					<h2 class="text-2xl font-bold text-secondary">Reservasi</h2>
					<p class="text-secondary/60">Kelola dan pantau status reservasi Anda</p>
				</div>
			</div>
			<div class="flex flex-col items-end gap-2">
				<Button
					variant="outline"
					size="sm"
					class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-white"
						onclick={() => window.location.reload()}
					disabled={loading}
				>
					<RefreshCw class="mr-2 size-4 {loading ? 'animate-spin' : ''}" />
					Refresh Data
				</Button>
				<p class="text-xs text-secondary/40">
					Klik refresh jika data belum diperbarui
				</p>
			</div>
		</div>

		<!-- Active Reservations Section -->
		<section>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-senary/10 p-2">
					<Calendar class="size-8 text-senary" />
				</div>
				<h3 class="text-xl font-bold text-secondary">Reservasi Aktif</h3>
			</div>

			{#if activeReservations.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm"
				>
					<div class="mb-4 rounded-full bg-white/5 p-4 shadow-inner">
						<Calendar class="size-8 text-secondary/40" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-secondary">Tidak ada reservasi aktif</h3>
					<p class="text-sm text-secondary/50">Anda tidak memiliki janji temu yang akan datang.</p>

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
											Pesanan Dibuat pada: {(() => {
												const date = new Date(reservation.created_at);
												date.setHours(date.getHours() + 7); // Add 7 hours
												return date
													.toLocaleString('id-ID', {
														year: 'numeric',
														month: 'numeric',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
														timeZone: 'Asia/Jakarta'
													})
													.replace(/\//g, '-');
											})()} WIB
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
											<span>{reservation.dateTime.hour} WIB</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/70">
											<User class="size-4 text-senary/70" />
											<span>Barber: {reservation.barber.name}</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/70">
											<Scissors class="size-4 text-senary/70" />
											<span>Layanan: {reservation.service.name}</span>
										</div>
									</div>
								</div>
							</div>
							{#if reservation.status === 'waitingForPayment'}
								<div class="mt-4 mb-4">
									<Countdown
										date={reservation.updated_at ||
											reservation.created_at ||
											new Date().toISOString()}
										onExpire={() => {
											reservation.status = 'expired';
										}}
									/>
								</div>
							{/if}

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
											Batal
										{/if}
									</Button>
									<Button
										variant="outline"
										class="relative border-senary/30 text-senary transition-all duration-300 hover:border-senary hover:bg-senary/10 hover:text-senary"
										onclick={() => openChatModal(reservation)}
									>
										<MessageCircle class="mr-2 size-4" />
										Chat
										{#if unreadCounts[reservation.reservationID] > 0}
											<span
												class="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
											>
												{unreadCounts[reservation.reservationID]}
											</span>
										{/if}
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
											Jadwal Ulang
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
											Batal
										{/if}
									</Button>
									<Button
										variant="outline"
										class="relative border-senary/30 text-senary transition-all duration-300 hover:border-senary hover:bg-senary/10 hover:text-senary"
										onclick={() => openChatModal(reservation)}
									>
										<MessageCircle class="mr-2 size-4" />
										Chat
										{#if unreadCounts[reservation.reservationID] > 0}
											<span
												class="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
											>
												{unreadCounts[reservation.reservationID]}
											</span>
										{/if}
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
											Batal
										{/if}
									</Button>
									<Button
										variant="outline"
										class="relative border-senary/30 text-senary transition-all duration-300 hover:border-senary hover:bg-senary/10 hover:text-senary"
										onclick={() => openChatModal(reservation)}
									>
										<MessageCircle class="mr-2 size-4" />
										Chat
										{#if unreadCounts[reservation.reservationID] > 0}
											<span
												class="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
											>
												{unreadCounts[reservation.reservationID]}
											</span>
										{/if}
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
											Bayar Sekarang
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
											Batal
										{/if}
									</Button>
									<Button
										variant="outline"
										class="relative border-senary/30 text-senary transition-all duration-300 hover:border-senary hover:bg-senary/10 hover:text-senary"
										onclick={() => openChatModal(reservation)}
									>
										<MessageCircle class="mr-2 size-4" />
										Chat
										{#if unreadCounts[reservation.reservationID] > 0}
											<span
												class="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
											>
												{unreadCounts[reservation.reservationID]}
											</span>
										{/if}
									</Button>
								{/if}
								<Button
									variant="outline"
									class="border-senary/20 text-secondary/70 transition-all duration-300 hover:border-senary/50 hover:bg-senary/5 hover:text-senary"
									onclick={() => goto(`/profile/reservation/${reservation.reservationID}`)}
								>
									<Eye class="mr-2 size-4" />
									Detail
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
				<h3 class="text-xl font-bold text-secondary">Riwayat</h3>
			</div>

			{#if historyReservations.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12 text-center backdrop-blur-sm"
				>
					<div class="mb-4 rounded-full bg-white/5 p-4 shadow-inner">
						<History class="size-8 text-secondary/40" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-secondary">Tidak ada riwayat ditemukan</h3>
					<p class="text-sm text-secondary/50">Anda tidak memiliki reservasi sebelumnya.</p>
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
											Pesanan Dibuat pada: {(() => {
												const date = new Date(reservation.created_at);
												date.setHours(date.getHours() + 7); // Add 7 hours
												return date
													.toLocaleString('id-ID', {
														year: 'numeric',
														month: 'numeric',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
														timeZone: 'Asia/Jakarta'
													})
													.replace(/\//g, '-');
											})()} WIB
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
											<span>{reservation.dateTime.hour} WIB</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/60">
											<User class="size-3" />
											<span>Barber: {reservation.barber.name}</span>
										</div>
										<div class="flex items-center gap-2 text-sm text-secondary/60">
											<Scissors class="size-3" />
											<span>Layanan: {reservation.service.name}</span>
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
		userId={$authStore.session?.user?.id || ''}
	/>

	<Sheet bind:open={showPaymentSheet}>
		<SheetContent side="right" class="w-full border-l border-white/10 bg-black/95 p-0 sm:max-w-md">
			<SheetHeader class="px-6 py-4">
				<SheetTitle class="text-senary">Pembayaran</SheetTitle>
				<SheetDescription class="text-secondary/60">
					Selesaikan pembayaran Anda untuk reservasi #{currentReservationForPayment?.invoice ||
						currentReservationForPayment?.reservationID}
				</SheetDescription>
			</SheetHeader>
			<div class="h-full w-full overflow-y-auto px-6 pb-6">
				<div id="snap-container" class="w-full"></div>
			</div>
		</SheetContent>
	</Sheet>
{/if}
<!-- Customer Chat Modal -->

<!-- Cancel Reservation Dialog -->
<AlertDialog open={showCancelDialog}>
	<AlertDialogContent class="border border-white/10 bg-primary text-secondary">
		<AlertDialogHeader>
			<AlertDialogTitle class="text-white">Batalkan Reservasi?</AlertDialogTitle>
			<AlertDialogDescription class="text-secondary/70">
				{#if showDownPaymentWarning}
					<div
						class="mt-2 mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300"
					>
						<p>Peringatan: Uang muka tidak dapat dikembalikan.</p>
					</div>
				{/if}
				Apakah Anda yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat dibatalkan.
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
				Tidak, Simpan
			</AlertDialogCancel>
			<AlertDialogAction
				class="bg-red-600 text-white hover:bg-red-700"
				onclick={confirmCancelReservation}
			>
				Ya, Batalkan
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<!-- Reschedule Warning Dialog -->
<AlertDialog open={showRescheduleWarning}>
	<AlertDialogContent class="border border-white/10 bg-primary text-secondary">
		<AlertDialogHeader>
			<AlertDialogTitle class="text-white">Syarat & Ketentuan Reschedule</AlertDialogTitle>
			<AlertDialogDescription class="text-secondary/70">
				<div
					class="mt-2 mb-4 rounded-lg border border-senary/30 bg-senary/10 p-3 text-sm text-senary"
				>
					<p>Penting: Reservasi hanya dapat di-reschedule maksimal 1 kali.</p>
				</div>
				Apakah Anda yakin ingin melanjutkan proses reschedule?
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel
				class="border-white/10 bg-transparent text-secondary hover:bg-white/10 hover:text-white"
				onclick={() => {
					showRescheduleWarning = false;
					reservationToReschedule = null;
				}}
			>
				Batal
			</AlertDialogCancel>
			<AlertDialogAction
				class="bg-senary text-primary hover:bg-senary/90"
				onclick={confirmReschedule}
			>
				Lanjut Reschedule
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
