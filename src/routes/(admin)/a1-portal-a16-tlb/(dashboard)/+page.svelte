<script lang="ts">
	import {
		Users,
		CalendarCheck,
		Banknote,
		TrendingUp,
		Scissors,
		Clock,
		ArrowUpRight,
		ArrowDownRight,
		CalendarDays,
		AlertCircle,
		History,
		MessageSquare,
		Activity,
		CreditCard,
		Wallet,
		MoreHorizontal,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import { format } from 'date-fns';
	import { getDashboardInfo, type DashboardData } from '$lib/api/admin/dashboard';
	import { onMount } from 'svelte';
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import ReservationDetailModal from "./Reservation/ReservationDetailModal.svelte";
	import { goto } from '$app/navigation';

	let { data } = $props();
	let token = $derived(data.session?.access_token || '');

	let dashboardData = $state<DashboardData | null>(null);
	let isLoading = $state(true);

	// Modal State
	let selectedReservationId = $state<string | null>(null);
	let isDetailModalOpen = $state(false);

	function openDetailModal(id: string) {
		selectedReservationId = id;
		isDetailModalOpen = true;
	}

	function closeDetailModal() {
		isDetailModalOpen = false;
		selectedReservationId = null;
	}

	// Pagination State
	let pendingPage = $state(1);
	let ongoingPage = $state(1);
	let upcomingPage = $state(1);
	const ITEMS_PER_PAGE = 5;

	// Pending Actions (Action Required)
	let paginatedPendingItems = $derived(
		(dashboardData?.operational.pending_actions || []).slice((pendingPage - 1) * ITEMS_PER_PAGE, pendingPage * ITEMS_PER_PAGE)
	);
	let totalPendingPages = $derived(Math.ceil((dashboardData?.operational.pending_actions.length || 0) / ITEMS_PER_PAGE));

	// Ongoing Reservations (Today)
	let paginatedOngoingItems = $derived(
		(dashboardData?.operational.ongoing_reservations || []).slice((ongoingPage - 1) * ITEMS_PER_PAGE, ongoingPage * ITEMS_PER_PAGE)
	);
	let totalOngoingPages = $derived(Math.ceil((dashboardData?.operational.ongoing_reservations.length || 0) / ITEMS_PER_PAGE));

	// Upcoming (Next 3 Days)
	let paginatedUpcomingItems = $derived(
		(dashboardData?.operational.upcoming_reservations || []).slice((upcomingPage - 1) * ITEMS_PER_PAGE, upcomingPage * ITEMS_PER_PAGE)
	);
	let totalUpcomingPages = $derived(Math.ceil((dashboardData?.operational.upcoming_reservations.length || 0) / ITEMS_PER_PAGE));

	async function loadDashboardData() {
		if (!token) return;
		isLoading = true;
		const res = await getDashboardInfo(fetch, token);
		if (res.success && res.data) {
			dashboardData = res.data;
		}
		isLoading = false;
	}

	$effect(() => {
		if (token) {
			loadDashboardData();
		}
	});

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	};
</script>

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30 pb-20">
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
					<p class="text-3xl font-bold text-senary">{format(new Date(), 'dd MMM yyyy')}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Today's Date</p>
				</div>
			</div>
			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Dashboard <span class="text-senary">Overview</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Monitor your barbershop's day-to-day operations, financial performance, and reservation activities in real-time.
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8">
		<div class="mx-auto max-w-[1600px] space-y-8">
			
			{#if isLoading}
				<div class="flex h-[400px] items-center justify-center">
					<div class="h-8 w-8 animate-spin rounded-full border-2 border-senary border-t-transparent"></div>
				</div>
			{:else if dashboardData}
				<!-- Operational Stats -->
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					<!-- Unread Chats -->
					<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-senary/30 hover:bg-white/5">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs font-bold text-secondary/50 uppercase tracking-widest">Unread Chats</p>
								<div class="mt-4 flex flex-col items-start gap-2">
									<h3 class="text-4xl font-bold text-white group-hover:text-senary transition-colors">{dashboardData.operational.unread_chat_count}</h3>
									<Button 
										variant="ghost" 
										size="sm" 
										class="h-6 -ml-2 text-xs text-secondary/50 hover:text-senary hover:bg-transparent px-2"
										onclick={() => goto('/a1-portal-a16-tlb/Chat')}
									>
										Open Chat →
									</Button>
								</div>
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
								<MessageSquare class="h-6 w-6" />
							</div>
						</div>
					</div>

					<!-- Pending Actions -->
					<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-senary/30 hover:bg-white/5">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs font-bold text-secondary/50 uppercase tracking-widest">Pending Actions</p>
								<div class="mt-4 flex items-baseline gap-2">
									<h3 class="text-4xl font-bold text-white group-hover:text-senary transition-colors">{dashboardData.operational.pending_actions.length}</h3>
									<span class="text-sm text-secondary/50">Reservations</span>
								</div>
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-white transition-all">
								<Activity class="h-6 w-6" />
							</div>
						</div>
					</div>

					<!-- Today's Reservations -->
					<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-senary/30 hover:bg-white/5">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs font-bold text-secondary/50 uppercase tracking-widest">Today's Total</p>
								<div class="mt-4 flex items-baseline gap-2">
									<h3 class="text-4xl font-bold text-white group-hover:text-senary transition-colors">{dashboardData.operational.ongoing_reservations.length}</h3>
									<span class="text-sm text-secondary/50">Services</span>
								</div>
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
								<Scissors class="h-6 w-6" />
							</div>
						</div>
					</div>

					<!-- Today's Revenue -->
					<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-senary/30 hover:bg-white/5">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-xs font-bold text-secondary/50 uppercase tracking-widest">Today's Revenue</p>
								<div class="mt-4 flex items-baseline gap-2">
									<h3 class="text-2xl font-bold text-white group-hover:text-senary transition-colors">{formatCurrency(dashboardData.finance_overview.today.total)}</h3>
								</div>
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-senary/10 text-senary ring-1 ring-senary/20 group-hover:bg-senary group-hover:text-primary transition-all">
								<Banknote class="h-6 w-6" />
							</div>
						</div>
					</div>
				</div>

				<!-- Finance Detail Overview - Unified Block -->
				<div class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md relative overflow-hidden">
					<div class="flex items-center justify-between mb-8">
						<div class="flex items-center gap-3">
							<div class="p-2 rounded-full bg-senary/10 text-senary">
								<TrendingUp class="h-5 w-5" />
							</div>
							<h3 class="text-lg font-bold text-white">Financial Performance</h3>
						</div>
						<Button variant="ghost" size="sm" class="h-6 text-[10px] uppercase tracking-wider text-secondary/50 hover:text-white" onclick={() => goto('/a1-portal-a16-tlb/Finance')}>See Details</Button>
					</div>

					<div class="grid gap-8 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
						<!-- Today -->
						<div class="lg:pr-8 pt-8 lg:pt-0">
							<div class="flex items-center justify-between mb-6">
								<h4 class="text-sm font-medium text-secondary/70">Daily Breakdown</h4>
								<div class="text-xs font-medium text-senary bg-senary/10 px-3 py-1 rounded-full border border-senary/20">TODAY</div>
							</div>
							<div class="space-y-6">
								<div class="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
									<div class="flex items-center gap-3">
										<div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
											<CreditCard class="h-5 w-5" />
										</div>
										<span class="font-medium text-secondary">Online</span>
									</div>
									<span class="font-bold text-white tracking-wide">{formatCurrency(dashboardData.finance_overview.today.online)}</span>
								</div>
								<div class="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
									<div class="flex items-center gap-3">
										<div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
											<Wallet class="h-5 w-5" />
										</div>
										<span class="font-medium text-secondary">Offline</span>
									</div>
									<span class="font-bold text-white tracking-wide">{formatCurrency(dashboardData.finance_overview.today.offline)}</span>
								</div>
							</div>
						</div>

						<!-- Weekly -->
						<div class="lg:px-8 pt-8 lg:pt-0">
							<div class="flex items-center justify-between mb-6">
								<h4 class="text-sm font-medium text-secondary/70">Weekly Report</h4>
								<div class="text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">7 DAYS</div>
							</div>
							<div class="flex items-end gap-2 mb-6">
								<span class="text-4xl font-bold text-white">{formatCurrency(dashboardData.finance_overview.week.total)}</span>
							</div>
							<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
								<div class="h-full bg-blue-500" style="width: {(dashboardData.finance_overview.week.online / Math.max(dashboardData.finance_overview.week.total, 1)) * 100}%"></div>
								<div class="h-full bg-emerald-500" style="width: {(dashboardData.finance_overview.week.offline / Math.max(dashboardData.finance_overview.week.total, 1)) * 100}%"></div>
							</div>
							<div class="flex gap-4 mt-4">
								<div class="flex items-center gap-2 text-xs">
									<div class="w-2 h-2 rounded-full bg-blue-500"></div>
									<span class="text-secondary/70">Online</span>
								</div>
								<div class="flex items-center gap-2 text-xs">
									<div class="w-2 h-2 rounded-full bg-emerald-500"></div>
									<span class="text-secondary/70">Offline</span>
								</div>
							</div>
						</div>

						<!-- Monthly -->
						<div class="lg:pl-8 pt-8 lg:pt-0">
							<div class="flex items-center justify-between mb-6">
								<h4 class="text-sm font-medium text-secondary/70">Monthly Report</h4>
								<div class="text-xs font-medium text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">30 DAYS</div>
							</div>
							<div class="flex items-end gap-2 mb-6">
								<span class="text-4xl font-bold text-white">{formatCurrency(dashboardData.finance_overview.month.total)}</span>
							</div>
							<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
								<div class="h-full bg-purple-500" style="width: {(dashboardData.finance_overview.month.online / Math.max(dashboardData.finance_overview.month.total, 1)) * 100}%"></div>
								<div class="h-full bg-emerald-500" style="width: {(dashboardData.finance_overview.month.offline / Math.max(dashboardData.finance_overview.month.total, 1)) * 100}%"></div>
							</div>
							<div class="flex gap-4 mt-4">
								<div class="flex items-center gap-2 text-xs">
									<div class="w-2 h-2 rounded-full bg-purple-500"></div>
									<span class="text-secondary/70">Online</span>
								</div>
								<div class="flex items-center gap-2 text-xs">
									<div class="w-2 h-2 rounded-full bg-emerald-500"></div>
									<span class="text-secondary/70">Offline</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Lists Grid -->
				<div class="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
					
					<!-- 1. Action Required (Pending) -->
					<div class="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-1 backdrop-blur-md">
						<div class="p-6">
							<div class="mb-6 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="p-2 rounded-full bg-yellow-500/10 text-yellow-500">
										<AlertCircle class="h-5 w-5" />
									</div>
									<h3 class="text-lg font-bold text-white">Action Required</h3>
								</div>
								<Badge variant="outline" class="border-yellow-500/20 text-yellow-500 bg-yellow-500/5">
									{dashboardData.operational.pending_actions.length} Pending
								</Badge>
							</div>
							
							<div class="space-y-4 min-h-[300px]">
								{#each paginatedPendingItems as item}
									<div class="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 hover:bg-yellow-500/10 transition-colors">
										<div class="flex items-center gap-4">
											<div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 font-bold">
												{item.customerName.charAt(0)}
											</div>
											<div>
												<p class="font-medium text-white text-sm">{item.customerName}</p>
												<p class="text-xs text-secondary/60">{item.serviceName} • {item.barberName}</p>
												
												<!-- Status Badge -->
												<div class="mt-1">
													{#if item.status === 'requestToReschedule'}
														<Badge variant="outline" class="border-purple-500/30 text-purple-500 text-[10px] h-5 px-1.5 py-0">Reschedule Req</Badge>
													{:else}
														<Badge variant="outline" class="border-yellow-500/30 text-yellow-500 text-[10px] h-5 px-1.5 py-0">Waiting</Badge>
													{/if}
												</div>
											</div>
										</div>
										<Button
											variant="outline"
											size="sm"
											class="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black"
											onclick={() => openDetailModal(item.reservationID)}
										>
											Review
										</Button>
									</div>
								{/each}
								{#if dashboardData.operational.pending_actions.length === 0}
									<div class="text-center py-12 border border-dashed border-white/10 rounded-2xl h-[300px] flex flex-col items-center justify-center">
										<AlertCircle class="h-12 w-12 text-secondary/20 mb-4" />
										<p class="text-sm text-secondary/40">No pending actions</p>
									</div>
								{/if}
							</div>
							
							{#if totalPendingPages > 1}
								<div class="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
									<span class="text-xs text-secondary/50">Page {pendingPage} of {totalPendingPages}</span>
									<div class="flex gap-2">
										<Button variant="ghost" size="icon" class="h-7 w-7" disabled={pendingPage === 1} onclick={() => pendingPage--}>
											<ChevronLeft class="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon" class="h-7 w-7" disabled={pendingPage === totalPendingPages} onclick={() => pendingPage++}>
											<ChevronRight class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- 2. Ongoing Reservations (Today) -->
					<div class="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-1 backdrop-blur-md">
						<div class="p-6">
							<div class="mb-6 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
										<Scissors class="h-5 w-5" />
									</div>
									<h3 class="text-lg font-bold text-white">Ongoing Today</h3>
								</div>
								<Badge variant="outline" class="border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
									{dashboardData.operational.ongoing_reservations.length} Active
								</Badge>
							</div>
							
							<div class="space-y-4 min-h-[300px]">
								{#each paginatedOngoingItems as item}
									<div class="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors">
										<div class="flex items-center gap-4">
											<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
												{item.customerName.charAt(0)}
											</div>
											<div>
												<p class="font-medium text-white text-sm">{item.customerName}</p>
												<p class="text-xs text-secondary/60">{item.serviceName} • {item.barberName}</p>
												<div class="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs">
													<Clock class="h-3 w-3" />
													<span>{item.time}</span>
												</div>
											</div>
										</div>
										<div class="flex items-center gap-2">
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 text-secondary/40 hover:text-white"
												onclick={() => openDetailModal(item.reservationID)}
											>
												<MoreHorizontal class="h-4 w-4" />
											</Button>
										</div>
									</div>
								{/each}
								{#if dashboardData.operational.ongoing_reservations.length === 0}
									<div class="text-center py-12 border border-dashed border-white/10 rounded-2xl h-[300px] flex flex-col items-center justify-center">
										<Activity class="h-12 w-12 text-secondary/20 mb-4" />
										<p class="text-sm text-secondary/40">No ongoing reservations</p>
									</div>
								{/if}
							</div>
							
							{#if totalOngoingPages > 1}
								<div class="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
									<span class="text-xs text-secondary/50">Page {ongoingPage} of {totalOngoingPages}</span>
									<div class="flex gap-2">
										<Button variant="ghost" size="icon" class="h-7 w-7" disabled={ongoingPage === 1} onclick={() => ongoingPage--}>
											<ChevronLeft class="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon" class="h-7 w-7" disabled={ongoingPage === totalOngoingPages} onclick={() => ongoingPage++}>
											<ChevronRight class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Upcoming List -->
					<div class="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-1 backdrop-blur-md">
						<div class="p-6">
							<div class="mb-6 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="p-2 rounded-full bg-blue-500/10 text-blue-500">
										<CalendarCheck class="h-5 w-5" />
									</div>
									<h3 class="text-lg font-bold text-white">Upcoming</h3>
								</div>
								<Badge variant="outline" class="border-blue-500/20 text-blue-500 bg-blue-500/5">
									{dashboardData.operational.upcoming_reservations.length} (Next 3 Days)
								</Badge>
							</div>

							<div class="space-y-3 min-h-[300px]">
								{#each paginatedUpcomingItems as item}
									<div class="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors group">
										<div class="flex items-center gap-4">
											<div class="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-white/5 border border-white/10 group-hover:border-senary/30 transition-colors">
												<span class="text-[10px] font-bold text-secondary/60 uppercase">{format(new Date(item.date), 'MMM')}</span>
												<span class="text-lg font-bold text-white">{format(new Date(item.date), 'dd')}</span>
											</div>
											<div>
												<p class="font-medium text-white text-sm">{item.customerName}</p>
												<p class="text-xs text-secondary/60">{item.serviceName}</p>
											</div>
										</div>
										<div class="flex flex-col items-end gap-2">
											<div class="flex items-center gap-1.5 text-senary bg-senary/5 px-2 py-1 rounded-md border border-senary/10 mb-1">
												<Clock class="h-3 w-3" />
												<span class="text-xs font-medium">{item.time}</span>
											</div>
											<Button
												variant="ghost"
												size="icon"
												class="h-6 w-6 text-secondary/40 hover:text-white"
												onclick={() => openDetailModal(item.reservationID)}
											>
												<ArrowUpRight class="h-3 w-3" />
											</Button>
										</div>
									</div>
								{/each}
								{#if paginatedUpcomingItems.length === 0}
									<div class="text-center py-12 border border-dashed border-white/10 rounded-2xl h-[300px] flex flex-col items-center justify-center">
										<CalendarDays class="h-12 w-12 text-secondary/20 mb-4" />
										<p class="text-sm text-secondary/40">No upcoming reservations</p>
									</div>
								{/if}
							</div>

							{#if totalUpcomingPages > 1}
								<div class="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
									<span class="text-xs text-secondary/50">Page {upcomingPage} of {totalUpcomingPages}</span>
									<div class="flex gap-2">
										<Button variant="ghost" size="icon" class="h-7 w-7" disabled={upcomingPage === 1} onclick={() => upcomingPage--}>
											<ChevronLeft class="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="icon" class="h-7 w-7" disabled={upcomingPage === totalUpcomingPages} onclick={() => upcomingPage++}>
											<ChevronRight class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<ReservationDetailModal
	bind:open={isDetailModalOpen}
	reservationId={selectedReservationId}
	{token}
	onClose={closeDetailModal}
	onUpdate={loadDashboardData}
/>