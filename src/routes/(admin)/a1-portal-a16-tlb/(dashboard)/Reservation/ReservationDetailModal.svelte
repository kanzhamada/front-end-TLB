<script lang="ts">
	import { 
		getReservationById, 
		acceptReservation, 
		declineReservation, 
		cancelReservation, 
		acceptReschedule,
		declineReschedule,
		completeReservation
	} from '$lib/api/admin/reservation';
	import type { Reservation } from '$lib/api/admin/reservation';
	import { toast } from 'svelte-sonner';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { X, Calendar, Clock, Scissors, CreditCard, User, Phone, Loader2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import AdminConfirmDialog from '$lib/components/ui/AdminConfirmDialog.svelte';

	let { reservationId = null, token, open = $bindable(false), onClose, onUpdate } = $props<{
		reservationId?: string | null;
		token: string;
		open: boolean;
		onClose: () => void;
		onUpdate: () => void;
	}>();

	let reservation = $state<Reservation | null>(null);
	let loading = $state(false);

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
	// Confirmation Dialog State
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmDescription = $state('');
	let confirmVariant = $state<'default' | 'destructive' | 'success'>('default');
	let pendingAction = $state<string | null>(null);
	let actionLoading = $state(false);

	function initiateAction(action: string) {
		pendingAction = action;
		const actionName = action.replace('-', ' ');
		
		switch (action) {
			case 'accept':
			case 'accept-reschedule':
				confirmTitle = 'Accept Reservation';
				confirmDescription = 'Are you sure you want to accept this reservation? This will update the status and notify the customer.';
				confirmVariant = 'success';
				break;
			case 'decline':
			case 'decline-reschedule':
				confirmTitle = 'Decline Request';
				confirmDescription = 'Are you sure you want to decline this request? This action cannot be undone.';
				confirmVariant = 'destructive';
				break;
			case 'cancel':
				confirmTitle = 'Cancel Reservation';
				confirmDescription = 'Are you sure you want to cancel this reservation? The customer will be notified.';
				confirmVariant = 'destructive';
				break;
			case 'complete':
				confirmTitle = 'Complete Reservation';
				confirmDescription = 'Are you sure you want to mark this reservation as completed? This implies the service has been delivered.';
				confirmVariant = 'success';
				break;
			default:
				confirmTitle = 'Confirm Action';
				confirmDescription = `Are you sure you want to ${actionName}?`;
				confirmVariant = 'default';
		}
		confirmOpen = true;
	}

	async function handleConfirmAction() {
		if (!reservationId || !pendingAction) return;
		
		actionLoading = true;
		let res;
		
		try {
			switch (pendingAction) {
				case 'accept':
					res = await acceptReservation(fetch, reservationId, token);
					break;
				case 'decline':
					res = await declineReservation(fetch, reservationId, token);
					break;
				case 'cancel':
					res = await cancelReservation(fetch, reservationId, token);
					break;
				case 'complete':
					res = await completeReservation(fetch, reservationId, token);
					break;
				case 'accept-reschedule':
					res = await acceptReschedule(fetch, reservationId, token);
					break;
				case 'decline-reschedule':
					res = await declineReschedule(fetch, reservationId, token);
					break;
			}

			if (res?.success) {
				toast.success(`Reservation ${pendingAction.replace('-', ' ')}ed successfully`);
				onUpdate();
				onClose();
			} else {
				toast.error(res?.message || `Failed to ${pendingAction} reservation`);
			}
		} catch (error) {
			toast.error('An error occurred during the action');
			console.error(error);
		} finally {
			actionLoading = false;
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
				return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
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
					<h2 class="text-2xl font-bold tracking-tight text-secondary">Reservation <span class="text-senary">Details</span></h2>
					<p class="text-xs font-light text-secondary/60 uppercase tracking-widest mt-1">Manage Booking Information</p>
				</div>
				<button
					onclick={onClose}
					class="rounded-full p-2 text-secondary/50 transition-colors hover:bg-white/10 hover:text-white"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<div class="max-h-[70vh] overflow-y-auto px-8 py-8 no-scrollbar">
				{#if loading}
					<div class="flex h-40 items-center justify-center text-secondary/50">
						<div class="animate-pulse flex flex-col items-center gap-2">
							<div class="h-8 w-8 rounded-full border-2 border-senary border-t-transparent animate-spin"></div>
							<span class="text-xs tracking-widest uppercase">Loading details...</span>
						</div>
					</div>
				{:else if reservation}
					<div class="grid gap-8 md:grid-cols-3">
						<!-- Main Info -->
						<div class="md:col-span-2 space-y-8">
							<div class="flex items-start justify-between">
								<div>
									<h3 class="text-3xl font-light text-secondary">#{reservation.invoice || reservation.id}</h3>
									<p class="text-xs font-bold tracking-widest text-secondary/40 uppercase mt-1">Invoice ID</p>
								</div>
								<span class={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase ${getStatusColor(reservation.status)}`}>
									{reservation.status}
								</span>
							</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<div class="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:border-senary/20">
									<div class="flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase mb-2">
										<Calendar class="mr-2 h-3 w-3" /> Date
									</div>
									<p class="text-lg font-medium text-secondary">{reservation.dateTime?.date}</p>
								</div>
								<div class="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:border-senary/20">
									<div class="flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase mb-2">
										<Clock class="mr-2 h-3 w-3" /> Time
									</div>
									<p class="text-lg font-medium text-secondary">{reservation.dateTime?.hour}</p>
								</div>
								<div class="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:border-senary/20">
									<div class="flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase mb-2">
										<Scissors class="mr-2 h-3 w-3" /> Service
									</div>
									<p class="text-lg font-medium text-secondary">{reservation.service?.name}</p>
								</div>
								<div class="group rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:border-senary/20">
									<div class="flex items-center text-xs font-bold tracking-widest text-secondary/50 uppercase mb-2">
										<CreditCard class="mr-2 h-3 w-3" /> Price
									</div>
									<p class="text-lg font-medium text-senary">{formatCurrency(reservation.service?.price || 0)}</p>
								</div>
							</div>

							{#if reservation.reschedule}
								<div class="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 relative overflow-hidden">
									<div class="absolute top-0 right-0 p-4 opacity-10">
										<Calendar class="h-24 w-24 text-purple-500" />
									</div>
									<h4 class="mb-4 flex items-center text-sm font-bold tracking-widest text-purple-400 uppercase">
										<Clock class="mr-2 h-4 w-4" /> Reschedule Request
									</h4>
									<div class="grid gap-6 sm:grid-cols-2 relative z-10">
										<div>
											<p class="text-xs font-bold tracking-widest text-purple-300/50 uppercase mb-1">New Date</p>
											<p class="text-xl text-purple-100">{reservation.reschedule.newDate}</p>
										</div>
										<div>
											<p class="text-xs font-bold tracking-widest text-purple-300/50 uppercase mb-1">New Time</p>
											<p class="text-xl text-purple-100">{reservation.reschedule.newTime}</p>
										</div>
									</div>
								</div>
							{/if}

							{#if reservation.notes}
								<div class="rounded-2xl border border-white/5 bg-white/5 p-6">
									<p class="mb-2 text-xs font-bold tracking-widest text-secondary/50 uppercase">Notes</p>
									<p class="text-secondary italic">"{reservation.notes}"</p>
								</div>
							{/if}
						</div>

						<!-- Sidebar Info -->
						<div class="space-y-6">
							<div class="rounded-2xl border border-white/10 bg-white/5 p-6">
								<h3 class="mb-4 flex items-center text-xs font-bold tracking-widest text-secondary/80 uppercase">
									<User class="mr-2 h-3 w-3" /> Customer
								</h3>
								<div class="space-y-4">
									<div>
										<p class="text-lg font-medium text-secondary">{reservation.customer?.name}</p>
										<p class="text-xs text-secondary/50">Customer Name</p>
									</div>
									<div class="pt-4 border-t border-white/5">
										<div class="flex items-center text-sm text-secondary">
											<Phone class="mr-2 h-3 w-3 text-senary" />
											{reservation.customer?.phoneNumber || 'N/A'}
										</div>
									</div>
								</div>
							</div>

							<div class="rounded-2xl border border-white/10 bg-white/5 p-6">
								<h3 class="mb-4 flex items-center text-xs font-bold tracking-widest text-secondary/80 uppercase">
									<Scissors class="mr-2 h-3 w-3" /> Barber
								</h3>
								<p class="text-lg font-medium text-secondary">{reservation.barber?.name || 'Any Barber'}</p>
								<p class="text-xs text-secondary/50">Assigned Professional</p>
							</div>
							
							<div class="rounded-2xl border border-white/10 bg-white/5 p-6">
								<h3 class="mb-4 flex items-center text-xs font-bold tracking-widest text-secondary/80 uppercase">
									<Clock class="mr-2 h-3 w-3" /> Created
								</h3>
								<p class="text-sm text-secondary">{new Date(reservation.created_at).toLocaleDateString()}</p>
								<p class="text-xs text-secondary/50">{new Date(reservation.created_at).toLocaleTimeString()}</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			{#if reservation && !loading}
				<div class="border-t border-white/10 bg-white/5 px-8 py-6">
			{#if reservation.status === 'waiting'}
				<div class="flex justify-end gap-3">
					<Button 
						variant="outline" 
						class="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
						onclick={() => initiateAction('decline')}
					>
						Decline Request
					</Button>
					<Button 
						class="bg-senary text-primary hover:bg-senary/90 font-bold"
						onclick={() => initiateAction('accept')}
					>
						Accept Reservation
					</Button>
				</div>
			{:else if reservation.status === 'requestToReschedule'}
				<div class="flex justify-end gap-3">
					<Button 
						variant="outline" 
						class="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
						onclick={() => initiateAction('decline-reschedule')}
					>
						Decline Reschedule
					</Button>
					<Button 
						class="bg-senary text-primary hover:bg-senary/90 font-bold"
						onclick={() => initiateAction('accept-reschedule')}
					>
						Accept Reschedule
					</Button>
				</div>
			{:else if reservation.status === 'onGoing'}
				<div class="flex justify-end gap-3">
					<Button 
						variant="destructive" 
						class="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
						onclick={() => initiateAction('cancel')}
					>
						Cancel Reservation
					</Button>
					<Button 
						class="bg-senary text-primary hover:bg-senary/90 font-bold"
						onclick={() => initiateAction('complete')}
					>
						Complete Reservation
					</Button>
				</div>
			{/if}
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
	loading={actionLoading}
	onConfirm={handleConfirmAction}
/>
