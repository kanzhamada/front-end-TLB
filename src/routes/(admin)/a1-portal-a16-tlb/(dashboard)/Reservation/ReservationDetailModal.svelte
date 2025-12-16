<script lang="ts">
	import {
		getReservationById,
		acceptReservation,
		declineReservation,
		cancelReservation,
		completeReservation,
		acceptReschedule,
		declineReschedule,
		type Reservation
	} from '$lib/api/admin/reservation';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { toast } from 'svelte-sonner';
	import { X, Calendar, Clock, User, Scissors, Phone, CreditCard, MapPin } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import AdminConfirmDialog from '$lib/components/ui/AdminConfirmDialog.svelte';

	let { reservationId, token, onClose, onUpdate } = $props<{
		reservationId: string | null;
		token: string;
		onClose: () => void;
		onUpdate: () => void;
	}>();

	let reservation = $state<Reservation | null>(null);
	let loading = $state(false);

	$effect(() => {
		console.log("reservation", reservation)
	});

	// Confirmation Dialog State
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmDescription = $state('');
	let confirmVariant = $state<'default' | 'destructive'>('default');
	let confirmText = $state('');
	let confirmLoading = $state(false);
	let pendingAction = $state<string | null>(null);

	$effect(() => {
		if (reservationId) {
			loadReservation();
		} else {
			reservation = null;
		}
	});

	async function loadReservation() {
		if (!reservationId) return;
		loading = true;
		const res = await getReservationById(fetch, reservationId, token);
		if (res.success && res.data) {
			reservation = res.data;
			console.log('Modal reservation:', reservation);
		} else {
			toast.error(res.message || 'Failed to load reservation details');
			onClose();
		}
		loading = false;
	}

	function handleAction(action: string) {
		if (!reservationId) return;

		pendingAction = action;
		confirmVariant = 'default';
		confirmText = 'Confirm';

		switch (action) {
			case 'accept':
				confirmTitle = 'Accept Reservation';
				confirmDescription = 'Are you sure you want to accept this reservation?';
				confirmText = 'Accept';
				confirmVariant = 'default';
				break;
			case 'decline':
				confirmTitle = 'Decline Reservation';
				confirmDescription = 'Are you sure you want to decline this reservation? This action cannot be undone.';
				confirmText = 'Decline';
				confirmVariant = 'destructive';
				break;
			case 'cancel':
				confirmTitle = 'Cancel Reservation';
				confirmDescription = 'Are you sure you want to cancel this reservation? This action cannot be undone.';
				confirmText = 'Cancel Reservation';
				confirmVariant = 'destructive';
				break;
			case 'accept-reschedule':
				confirmTitle = 'Accept Reschedule';
				confirmDescription = 'Are you sure you want to accept this reschedule request?';
				confirmText = 'Accept Reschedule';
				confirmVariant = 'default';
				break;
			case 'decline-reschedule':
				confirmTitle = 'Decline Reschedule';
				confirmDescription = 'Are you sure you want to decline this reschedule request?';
				confirmText = 'Decline Reschedule';
				confirmVariant = 'destructive';
				break;
			case 'complete':
				confirmTitle = 'Complete Reservation';
				confirmDescription = 'Are you sure you want to mark this reservation as complete?';
				confirmText = 'Complete';
				confirmVariant = 'default';
				break;
		}

		confirmOpen = true;
	}

	async function executeAction() {
		if (!reservationId || !pendingAction) return;

		confirmLoading = true;
		let res;
		const action = pendingAction;

		try {
			switch (action) {
				case 'accept':
					res = await acceptReservation(fetch, reservationId, token);
					break;
				case 'decline':
					res = await declineReservation(fetch, reservationId, token);
					break;
				case 'cancel':
					res = await cancelReservation(fetch, reservationId, token);
					break;
				case 'accept-reschedule':
					res = await acceptReschedule(fetch, reservationId, token);
					break;
				case 'decline-reschedule':
					res = await declineReschedule(fetch, reservationId, token);
					break;
				case 'complete':
					res = await completeReservation(fetch, reservationId, token);
					break;
			}

			if (res?.success) {
				toast.success(`Reservation ${action.replace('-', ' ')}ed successfully`);
				onUpdate();
				onClose();
			} else {
				toast.error(res?.message || `Failed to ${action} reservation`);
			}
		} catch (error) {
			console.error('Error executing action:', error);
			toast.error('An unexpected error occurred');
		} finally {
			confirmLoading = false;
			confirmOpen = false;
			pendingAction = null;
		}
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'waiting':
			case 'pending':
				return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
			case 'paid':
			case 'success':
			case 'onGoing':
				return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
			case 'completed':
				return 'bg-green-400/10 text-green-400 border-green-400/20';
			case 'canceledByUser':
			case 'canceledByAdmin':
			case 'declined':
				return 'bg-red-400/10 text-red-400 border-red-400/20';
			case 'requestToReschedule':
				return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
			default:
				return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
		}
	};
</script>

{#if reservationId}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<div
			class="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && onClose()}
			in:scale={{ start: 0.95, duration: 200, easing: quintOut }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
				<div>
					<h2 class="text-2xl font-bold tracking-tight text-secondary">
						Reservation <span class="text-senary">Details</span>
					</h2>
					<p class="mt-1 text-xs font-light tracking-widest text-secondary/60 uppercase">
						Manage Booking Information
					</p>
				</div>
				<button
					onclick={onClose}
					class="rounded-full p-2 text-secondary/50 transition-colors hover:bg-white/10 hover:text-white"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<div class="no-scrollbar max-h-[70vh] overflow-y-auto px-8 py-8">
				{#if loading}
					<div class="flex h-40 items-center justify-center text-secondary/50">
						<div class="flex animate-pulse flex-col items-center gap-2">
							<div
								class="h-8 w-8 animate-spin rounded-full border-2 border-senary border-t-transparent"
							></div>
							<span class="text-xs tracking-widest uppercase">Loading details...</span>
						</div>
					</div>
				{:else if reservation}
					<div class="grid gap-8 md:grid-cols-3">
						<!-- Main Info -->
						<div class="space-y-8 md:col-span-2">
							<div class="flex items-start justify-between">
								<div>
									<h3 class="text-3xl font-light text-secondary">
										#{reservation.invoice}
									</h3>
									<p class="mt-1 text-xs font-bold tracking-widest text-secondary/40 uppercase">
										Invoice ID
									</p>
								</div>
								<span
									class={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase ${getStatusColor(reservation.status)}`}
								>
									{reservation.status}
								</span>
							</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<div
									class="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:border-senary/20"
								>
									<div
										class="mb-2 flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase"
									>
										<Calendar class="mr-2 h-3 w-3" /> Date
									</div>
									<p class="text-lg font-medium text-secondary">{reservation.dateTime?.date}</p>
								</div>
								<div
									class="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:border-senary/20"
								>
									<div
										class="mb-2 flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase"
									>
										<Clock class="mr-2 h-3 w-3" /> Time
									</div>
									<p class="text-lg font-medium text-secondary">{reservation.dateTime?.hour}</p>
								</div>
								<div
									class="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:border-senary/20"
								>
									<div
										class="mb-2 flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase"
									>
										<Scissors class="mr-2 h-3 w-3" /> Service
									</div>
									<p class="text-lg font-medium text-secondary">{reservation.service?.name}</p>
								</div>
								<div
									class="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:border-senary/20"
								>
									<div
										class="mb-2 flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase"
									>
										<CreditCard class="mr-2 h-3 w-3" /> Price
									</div>
									<p class="text-lg font-medium text-senary">
										{formatCurrency(reservation.service?.price || 0)}
									</p>
								</div>
							</div>

							{#if reservation.reschedule}
								<div
									class="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6"
								>
									<div class="absolute top-0 right-0 p-4 opacity-10">
										<Calendar class="h-24 w-24 text-purple-500" />
									</div>
									<h4
										class="mb-4 flex items-center text-sm font-bold tracking-widest text-purple-400 uppercase"
									>
										<Clock class="mr-2 h-4 w-4" /> Reschedule Request
									</h4>
									<div class="relative z-10 grid gap-6 sm:grid-cols-2">
										<div>
											<p
												class="mb-1 text-xs font-bold tracking-widest text-purple-300/50 uppercase"
											>
												New Date
											</p>
											<p class="text-xl text-purple-100">{reservation.reschedule.newDate}</p>
										</div>
										<div>
											<p
												class="mb-1 text-xs font-bold tracking-widest text-purple-300/50 uppercase"
											>
												New Time
											</p>
											<p class="text-xl text-purple-100">{reservation.reschedule.newTime}</p>
										</div>
									</div>
								</div>
							{/if}

							{#if reservation.payment}
								<div class="rounded-2xl border border-white/5 bg-white/5 p-6">
									<h4
										class="mb-4 flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase"
									>
										<CreditCard class="mr-2 h-3 w-3" /> Payment Details
									</h4>
									<div class="space-y-3">
										<div class="flex justify-between text-sm">
											<span class="text-secondary/70">Status</span>
											<span
												class={`rounded px-2 py-0.5 text-xs font-bold uppercase ${getStatusColor(reservation.payment.status)}`}
											>
												{reservation.payment.status}
											</span>
										</div>
										<div class="flex justify-between text-sm">
											<span class="text-secondary/70">Service Price</span>
											<span class="text-secondary"
												>{formatCurrency(reservation.payment.servicePrice)}</span
											>
										</div>
										<div class="flex justify-between text-sm">
											<span class="text-secondary/70">Admin Fee</span>
											<span class="text-secondary"
												>{formatCurrency(reservation.payment.adminFee)}</span
											>
										</div>
										<div class="flex justify-between text-sm">
											<span class="text-secondary/70">Midtrans Fee</span>
											<span class="text-secondary"
												>{formatCurrency(reservation.payment.midtransFee)}</span
											>
										</div>
										{#if reservation.payment.voucher > 0}
											<div class="flex justify-between text-sm text-green-400">
												<span>Voucher Discount</span>
												<span>-{formatCurrency(reservation.payment.voucher)}</span>
											</div>
										{/if}
										<Separator class="my-2 bg-white/10" />
										<div class="flex justify-between text-base font-bold">
											<span class="text-secondary">Total</span>
											<span class="text-senary"
												>{formatCurrency(reservation.payment.total)}</span
											>
										</div>
										<div class="flex justify-between text-sm">
											<span class="text-secondary/70">Down Payment</span>
											<span class="text-secondary"
												>{formatCurrency(reservation.payment.downPayment)}</span
											>
										</div>
										<div class="flex justify-between text-sm font-medium">
											<span class="text-secondary/70">Remaining</span>
											<span class="text-red-400"
												>{formatCurrency(reservation.payment.remaining)}</span
											>
										</div>
									</div>
								</div>
							{/if}

							{#if reservation.notes}
								<div class="rounded-2xl border border-white/5 bg-white/5 p-6">
									<p class="mb-2 text-xs font-bold tracking-widest text-secondary/50 uppercase">
										Notes
									</p>
									<p class="text-secondary italic">"{reservation.notes}"</p>
								</div>
							{/if}
						</div>

						<!-- Sidebar Info -->
						<div class="space-y-6">
							<div class="rounded-2xl border border-white/10 bg-white/5 p-6">
								<h3
									class="mb-4 flex items-center text-xs font-bold tracking-widest text-secondary/80 uppercase"
								>
									<User class="mr-2 h-3 w-3" /> Customer
								</h3>
								<div class="space-y-4">
									<div>
										<p class="text-lg font-medium text-secondary">{reservation.customer?.name}</p>
										<p class="text-xs text-secondary/50">Customer Name</p>
									</div>
									<div class="border-t border-white/5 pt-4">
										<div class="flex items-center text-sm text-secondary">
											<Phone class="mr-2 h-3 w-3 text-senary" />
											{reservation.customer?.phoneNumber || 'N/A'}
										</div>
									</div>
								</div>
							</div>

							<div class="rounded-2xl border border-white/10 bg-white/5 p-6">
								<h3
									class="mb-4 flex items-center text-xs font-bold tracking-widest text-secondary/80 uppercase"
								>
									<Scissors class="mr-2 h-3 w-3" /> Barber
								</h3>
								<p class="text-lg font-medium text-secondary">
									{reservation.barber?.name || 'Any Barber'}
								</p>
								<p class="text-xs text-secondary/50">Assigned Professional</p>
							</div>

							<div class="rounded-2xl border border-white/10 bg-white/5 p-6">
								<h3
									class="mb-4 flex items-center text-xs font-bold tracking-widest text-secondary/80 uppercase"
								>
									<Clock class="mr-2 h-3 w-3" /> Created
								</h3>
								<p class="text-sm text-secondary">
									{new Date(reservation.created_at).toLocaleDateString()}
								</p>
								<p class="text-xs text-secondary/50">
									{new Date(reservation.created_at).toLocaleTimeString()}
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			{#if reservation && !loading}
				<div class="border-t border-white/10 bg-white/5 px-8 py-6">
					<div class="flex flex-wrap justify-end gap-3">
						{#if reservation.status === 'waiting'}
							<Button
								variant="outline"
								class="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
								onclick={() => handleAction('decline')}
							>
								Decline Request
							</Button>
							<Button
								class="bg-senary font-bold tracking-wide text-primary hover:bg-senary/90"
								onclick={() => handleAction('accept')}
							>
								Accept Reservation
							</Button>
						{:else if reservation.status === 'onGoing'}
							<Button
								variant="outline"
								class="border-green-500/20 text-green-400 hover:bg-green-500/10 hover:text-green-300"
								onclick={() => handleAction('complete')}
							>
								Complete Reservation
							</Button>
							<Button variant="destructive" onclick={() => handleAction('cancel')}>
								Cancel Reservation
							</Button>
						{:else if reservation.status === 'requestToReschedule'}
							<Button
								variant="outline"
								class="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
								onclick={() => handleAction('decline-reschedule')}
							>
								Decline Reschedule
							</Button>
							<Button
								class="bg-purple-500 font-bold tracking-wide text-white hover:bg-purple-600"
								onclick={() => handleAction('accept-reschedule')}
							>
								Accept Reschedule
							</Button>
						{:else}
							<Button
								variant="outline"
								class="border-white/10 text-secondary hover:bg-white/10"
								onclick={onClose}>Close Details</Button
							>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<AdminConfirmDialog
	bind:open={confirmOpen}
	title={confirmTitle}
	description={confirmDescription}
	variant={confirmVariant}
	confirmText={confirmText}
	loading={confirmLoading}
	onConfirm={executeAction}
/>
