<script lang="ts">
	import { page } from '$app/stores';
	import { 
		getReservationById, 
		acceptReservation, 
		declineReservation, 
		cancelReservation, 
		acceptReschedule, 
		declineReschedule,
		type Reservation 
	} from '$lib/api/admin/reservation';
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { ArrowLeft, Calendar, Clock, User, Scissors, Phone, CreditCard } from 'lucide-svelte';

	let { data } = $props();
	let reservation = $state<Reservation | null>(null);
	let loading = $state(true);

	const id = $page.params.id;

	onMount(async () => {
		await loadReservation();
	});

	async function loadReservation() {
		loading = true;
		const token = data.session?.access_token || '';
		const res = await getReservationById(fetch, id, token);
		if (res.success && res.data) {
			reservation = res.data;
		} else {
			toast.error(res.message || 'Failed to load reservation details');
		}
		loading = false;
	}

	async function handleAction(action: string) {
		if (!confirm(`Are you sure you want to ${action.replace('-', ' ')}?`)) return;

		const token = data.session?.access_token || '';
		let res;

		switch (action) {
			case 'accept':
				res = await acceptReservation(fetch, id, token);
				break;
			case 'decline':
				res = await declineReservation(fetch, id, token);
				break;
			case 'cancel':
				res = await cancelReservation(fetch, id, token);
				break;
			case 'accept-reschedule':
				res = await acceptReschedule(fetch, id, token);
				break;
			case 'decline-reschedule':
				res = await declineReschedule(fetch, id, token);
				break;
		}

		if (res?.success) {
			toast.success(`Reservation ${action.replace('-', ' ')}ed successfully`);
			await loadReservation(); // Refresh data
		} else {
			toast.error(res?.message || `Failed to ${action} reservation`);
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

<div class="min-h-screen w-full bg-slate-950">
	<AdminHeader pageName="Reservation Details" description="View and manage reservation" />

	<div class="px-6 py-6">
		<div class="mx-auto max-w-4xl">
			<Button
				variant="ghost"
				class="mb-6 pl-0 text-secondary hover:bg-transparent hover:text-senary"
				onclick={() => goto('/a1-portal-a16-tlb/Reservation')}
			>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back to Reservations
			</Button>

			{#if loading}
				<div class="flex h-64 items-center justify-center text-secondary/50">
					Loading reservation details...
				</div>
			{:else if reservation}
				<div class="grid gap-6 md:grid-cols-3">
					<!-- Main Info -->
					<div class="md:col-span-2 space-y-6">
						<div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
							<div class="mb-6 flex items-start justify-between">
								<div>
<<<<<<< HEAD
									<h2 class="text-xl font-light text-secondary">Reservation #{reservation.invoice}</h2>
=======
									<h2 class="text-xl font-light text-secondary">Reservation #{reservation.id.slice(0, 8)}</h2>
>>>>>>> 7a8c9d606cf53b216e906b65c7b068e54ef13ee1
									<p class="text-sm text-secondary/60">Created on {new Date(reservation.created_at).toLocaleDateString()}</p>
								</div>
								<span class={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(reservation.status)}`}>
									{reservation.status}
								</span>
							</div>

							<div class="grid gap-6 sm:grid-cols-2">
								<div class="space-y-1">
									<div class="flex items-center text-sm text-secondary/60">
										<Calendar class="mr-2 h-4 w-4" /> Date
									</div>
									<p class="text-lg text-secondary">{reservation.dateTime?.date}</p>
								</div>
								<div class="space-y-1">
									<div class="flex items-center text-sm text-secondary/60">
										<Clock class="mr-2 h-4 w-4" /> Time
									</div>
									<p class="text-lg text-secondary">{reservation.dateTime?.hour}</p>
								</div>
								<div class="space-y-1">
									<div class="flex items-center text-sm text-secondary/60">
										<Scissors class="mr-2 h-4 w-4" /> Service
									</div>
									<p class="text-lg text-secondary">{reservation.service?.name}</p>
								</div>
								<div class="space-y-1">
									<div class="flex items-center text-sm text-secondary/60">
										<CreditCard class="mr-2 h-4 w-4" /> Price
									</div>
									<p class="text-lg text-secondary">{formatCurrency(reservation.service?.price || 0)}</p>
								</div>
							</div>

							{#if reservation.notes}
								<Separator class="my-6 bg-white/10" />
								<div>
									<p class="mb-2 text-sm font-medium text-secondary/60">Notes</p>
									<p class="text-secondary">{reservation.notes}</p>
								</div>
							{/if}
						</div>

						<!-- Actions -->
						<div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
							<h3 class="mb-4 text-lg font-light text-secondary">Actions</h3>
							<div class="flex flex-wrap gap-3">
								{#if reservation.status === 'waiting'}
									<Button class="bg-green-500 hover:bg-green-600 text-white" onclick={() => handleAction('accept')}>
										Accept Reservation
									</Button>
									<Button variant="destructive" onclick={() => handleAction('decline')}>
										Decline Reservation
									</Button>
								{:else if reservation.status === 'onGoing'}
									<Button variant="destructive" onclick={() => handleAction('cancel')}>
										Cancel Reservation
									</Button>
								{:else if reservation.status === 'requestToReschedule'}
									<Button class="bg-purple-500 hover:bg-purple-600 text-white" onclick={() => handleAction('accept-reschedule')}>
										Accept Reschedule
									</Button>
									<Button variant="destructive" onclick={() => handleAction('decline-reschedule')}>
										Decline Reschedule
									</Button>
								{:else}
									<p class="text-sm text-secondary/50">No actions available for this status.</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- Sidebar Info -->
					<div class="space-y-6">
						<!-- Customer Card -->
						<div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
							<h3 class="mb-4 flex items-center text-lg font-light text-secondary">
								<User class="mr-2 h-5 w-5" /> Customer
							</h3>
							<div class="space-y-4">
								<div>
									<p class="text-sm text-secondary/60">Name</p>
									<p class="text-secondary">{reservation.customer?.name}</p>
								</div>
								<div>
									<p class="text-sm text-secondary/60">Phone</p>
									<div class="flex items-center text-secondary">
										<Phone class="mr-2 h-3 w-3" />
										{reservation.customer?.phoneNumber || 'N/A'}
									</div>
								</div>
							</div>
						</div>

						<!-- Barber Card -->
						<div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
							<h3 class="mb-4 flex items-center text-lg font-light text-secondary">
								<Scissors class="mr-2 h-5 w-5" /> Barber
							</h3>
							<div>
								<p class="text-sm text-secondary/60">Assigned Barber</p>
								<p class="text-secondary">{reservation.barber?.name || 'Any Barber'}</p>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="text-center text-red-400">
					Reservation not found.
				</div>
			{/if}
		</div>
	</div>
</div>
