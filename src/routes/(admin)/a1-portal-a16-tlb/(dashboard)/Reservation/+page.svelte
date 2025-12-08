<script lang="ts">
	import { getReservations, type Reservation } from '$lib/api/admin/reservation';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		Calendar, Clock, User, Scissors, CheckCircle, XCircle, Check,
		Search,
		Filter,
		Trash2,
		Eye,
		Ellipsis,
		TrendingUp,
		CalendarDays,
		Users
	} from 'lucide-svelte';
	import { format } from 'date-fns';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import ReservationDetailModal from './ReservationDetailModal.svelte';
	import { fade, fly, scale } from 'svelte/transition';

	let { data } = $props();
	let reservations = $state<Reservation[]>([]);
	let searchQuery = $state('');
	let selectedStatuses = $state<string[]>([]);
	let selectedSort = $state<string>('newest');
	let selectedReservationId = $state<string | null>(null);

	async function loadReservations() {
		const token = data.session?.access_token || '';
		const res = await getReservations(fetch, token);
		if (res.success && res.data) {
			reservations = res.data;
		} else {
			toast.error(res.message || 'Failed to load reservations');
		}
	}

	onMount(async () => {
		await loadReservations();
	});

	// Calculate statistics
	const stats = $derived({
		total: reservations.length,
		completed: reservations.filter((r) => r.status === 'completed').length,
		pending: reservations.filter((r) => r.status === 'waiting').length,
		ongoing: reservations.filter((r) => r.status === 'onGoing').length,
		rate:
			reservations.length > 0
				? Math.round(
						(reservations.filter((r) => r.status === 'completed').length / reservations.length) *
							100
					)
				: 0
	});

	const filteredReservations = $derived(
		reservations
			.filter((r) => {
				const customerName = r.customer?.name || 'Unknown';
				const invoice = r.invoice || '';
				const matchesSearch = 
					customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					invoice.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(r.status);
				return matchesSearch && matchesStatus;
			})
			.sort((a, b) => {
				switch (selectedSort) {
					case 'newest':
						return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
					case 'oldest':
						return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
					case 'date-asc': {
						const dateA = new Date(`${a.dateTime?.date}T${a.dateTime?.hour || '00:00'}`);
						const dateB = new Date(`${b.dateTime?.date}T${b.dateTime?.hour || '00:00'}`);
						return dateA.getTime() - dateB.getTime();
					}
					case 'date-desc': {
						const dateA = new Date(`${a.dateTime?.date}T${a.dateTime?.hour || '00:00'}`);
						const dateB = new Date(`${b.dateTime?.date}T${b.dateTime?.hour || '00:00'}`);
						return dateB.getTime() - dateA.getTime();
					}
					default:
						return 0;
				}
			})
	);

	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 8;

	const totalPages = $derived(Math.ceil(filteredReservations.length / itemsPerPage));
	
	const paginatedReservations = $derived(
		filteredReservations.slice(
			(currentPage - 1) * itemsPerPage,
			currentPage * itemsPerPage
		)
	);

	// Reset to page 1 when filter changes
	$effect(() => {
		filteredReservations;
		currentPage = 1;
	});

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

	const statusOptions = [
		{ value: 'waiting', label: 'Waiting Approve' },
		{ value: 'onGoing', label: 'On Going' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'canceledByUser', label: 'Canceled by User' },
		{ value: 'canceledByAdmin', label: 'Canceled by Admin' },
		{ value: 'requestToReschedule', label: 'Reschedule Request' }
	];

	const sortOptions = [
		{ value: 'newest', label: 'Newest Created' },
		{ value: 'oldest', label: 'Oldest Created' },
		{ value: 'date-asc', label: 'Closest Reservation' },
		{ value: 'date-desc', label: 'Furthest Reservation' }
	];
</script>

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30">
	<!-- Hero Header -->
	<div class="relative w-full overflow-hidden px-8 pt-8 pb-8">
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>

		<div class="relative z-10 mx-auto max-w-[1600px]">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="h-[1px] w-12 bg-senary"></div>
					<p class="text-sm font-medium tracking-[0.3em] text-senary uppercase">Admin Portal</p>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold text-senary">{reservations.length}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Total Requests</p>
				</div>
			</div>

			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Reservation <span class="text-senary">Management</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Monitor and manage booking requests. Track status, view details, and handle customer appointments efficiently.
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8 pb-20">
		<div class="mx-auto max-w-[1600px]">
			<!-- Stats Cards -->
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
				<div class="group rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-senary/30 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold tracking-widest text-secondary/50 uppercase">Completed</p>
							<p class="mt-2 text-3xl font-light text-secondary group-hover:text-senary transition-colors">{stats.completed}</p>
						</div>
						<div class="rounded-full bg-green-400/10 p-3 text-green-400">
							<TrendingUp class="h-6 w-6" />
						</div>
					</div>
				</div>
				<div class="group rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-senary/30 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold tracking-widest text-secondary/50 uppercase">Pending</p>
							<p class="mt-2 text-3xl font-light text-secondary group-hover:text-senary transition-colors">{stats.pending}</p>
						</div>
						<div class="rounded-full bg-yellow-400/10 p-3 text-yellow-400">
							<Clock class="h-6 w-6" />
						</div>
					</div>
				</div>
				<div class="group rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-senary/30 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold tracking-widest text-secondary/50 uppercase">Ongoing</p>
							<p class="mt-2 text-3xl font-light text-secondary group-hover:text-senary transition-colors">{stats.ongoing}</p>
						</div>
						<div class="rounded-full bg-blue-400/10 p-3 text-blue-400">
							<Users class="h-6 w-6" />
						</div>
					</div>
				</div>
				<div class="group rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-senary/30 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold tracking-widest text-secondary/50 uppercase">Success Rate</p>
							<p class="mt-2 text-3xl font-light text-secondary group-hover:text-senary transition-colors">{stats.rate}%</p>
						</div>
						<div class="rounded-full bg-purple-400/10 p-3 text-purple-400">
							<CalendarDays class="h-6 w-6" />
						</div>
					</div>
				</div>
			</div>

			<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<!-- Search and Filter -->
				<div class="flex flex-1 gap-4">
					<div class="relative max-w-md flex-1">
						<Search
							class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-secondary/50"
						/>
						<Input
							placeholder="Search customer or invoice..."
							bind:value={searchQuery}
							class="w-full rounded-xl border-white/10 bg-white/5 py-6 pl-11 text-secondary placeholder:text-secondary/50 focus:border-senary/50 focus:ring-senary/20"
						/>
					</div>

					<!-- Sort Dropdown -->
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="outline"
									class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary"
								>
									<TrendingUp class="mr-2 h-4 w-4" />
									{sortOptions.find(o => o.value === selectedSort)?.label || 'Sort By'}
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="border-white/10 bg-slate-900 text-secondary">
							{#each sortOptions as option}
								<DropdownMenu.Item
									onclick={() => (selectedSort = option.value)}
									class="focus:bg-white/10 focus:text-senary"
								>
									{option.label}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<!-- Filter Dropdown -->
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="outline"
									class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary"
								>
									<Filter class="mr-2 h-4 w-4" />
									{selectedStatuses.length === 0 ? 'All Status' : `${selectedStatuses.length} Selected`}
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="border-white/10 bg-slate-900 text-secondary w-56">
							<DropdownMenu.CheckboxItem
								checked={selectedStatuses.length === 0}
								onclick={() => selectedStatuses = []}
								class="focus:bg-white/10 focus:text-senary flex items-center [&>span]:border [&>span]:border-white/20 [&>span]:bg-white/5 [&>span]:size-4 [&>span]:rounded-sm"
							>
								All Status
							</DropdownMenu.CheckboxItem>
							<DropdownMenu.Separator class="bg-white/20 my-2" />
							{#each statusOptions as option}
								<DropdownMenu.CheckboxItem
									checked={selectedStatuses.includes(option.value)}
									onclick={(e) => {
										e.preventDefault();
										if (selectedStatuses.includes(option.value)) {
											selectedStatuses = selectedStatuses.filter(s => s !== option.value);
										} else {
											selectedStatuses = [...selectedStatuses, option.value];
										}
									}}
									class="focus:bg-white/10 focus:text-senary flex items-center [&>span]:border [&>span]:border-white/20 [&>span]:bg-white/5 [&>span]:size-4 [&>span]:rounded-sm"
								>
									{option.label}
								</DropdownMenu.CheckboxItem>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>

			<div class="rounded-3xl border border-white/5 bg-black/40 backdrop-blur-md overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead class="border-b border-white/10 bg-white/5">
							<tr>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Invoice</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Customer</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Date & Time</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Amount</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-white/5">
							{#each paginatedReservations as reservation}
								<tr 
									class="transition-colors hover:bg-white/5 cursor-pointer"
									onclick={() => selectedReservationId = reservation.id}
								>
									<td class="p-6 font-medium text-senary">{reservation.invoice }</td>
									<td class="p-6 font-medium text-secondary">{reservation.customer?.name || 'Unknown'}</td>
									<td class="p-6 text-secondary/70">{reservation.dateTime?.date || 'N/A'} <span class="text-senary ml-1">{reservation.dateTime?.hour || ''}</span></td>
									<td class="p-6 text-secondary">{formatCurrency(reservation.service?.price || 0)}</td>
									<td class="p-6">
										<span
											class={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${getStatusColor(
												reservation.status
											)}`}
										>
											{reservation.status}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Pagination Controls -->
			{#if totalPages > 1}
				<div class="mt-8 flex items-center justify-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onclick={() => currentPage = Math.max(1, currentPage - 1)}
						disabled={currentPage === 1}
						class="text-secondary/70 hover:bg-white/10 hover:text-secondary disabled:opacity-30"
					>
						Previous
					</Button>
					
					<div class="flex items-center gap-1">
						{#each Array(totalPages) as _, i}
							<button
								class={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
									currentPage === i + 1
										? 'bg-senary text-primary'
										: 'text-secondary hover:bg-white/10'
								}`}
								onclick={() => currentPage = i + 1}
							>
								{i + 1}
							</button>
						{/each}
					</div>

					<Button
						variant="ghost"
						size="sm"
						onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
						disabled={currentPage === totalPages}
						class="text-secondary/70 hover:bg-white/10 hover:text-secondary disabled:opacity-30"
					>
						Next
					</Button>
				</div>
			{/if}
		</div>
	</div>

	<ReservationDetailModal
		reservationId={selectedReservationId}
		token={data.session?.access_token || ''}
		onClose={() => (selectedReservationId = null)}
		onUpdate={loadReservations}
	/>
</div>
