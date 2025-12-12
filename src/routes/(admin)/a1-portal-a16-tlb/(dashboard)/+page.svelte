<script lang="ts">
	import {
		Users,
		CalendarCheck,
		DollarSign,
		TrendingUp,
		Scissors,
		Clock,
		ArrowUpRight,
		ArrowDownRight,
		CalendarDays,
		AlertCircle,
		History
	} from 'lucide-svelte';
	import { scaleBand } from 'd3-scale';
	import { Chart, Svg, Axis, Bars, Tooltip } from 'layerchart';
	import { format } from 'date-fns';
	import { getDashboardInfo, type DashboardData } from '$lib/api/admin/dashboard';
	import AdminHeader from '$lib/components/Admin/AdminHeader/AdminHeader.svelte';
	import { onMount } from 'svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let { data } = $props();
	let token = $derived(data.session?.access_token || '');

	let dashboardData = $state<DashboardData | null>(null);
	let isLoading = $state(true);
	let activeChartTab = $state('weekly');

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

	// Chart Data Transformation
	const chartData = $derived.by(() => {
		if (!dashboardData) return [];
		const overview = dashboardData.revenue.overview;
		console.log('Dashboard Data:', dashboardData); // Debug log

		if (activeChartTab === 'weekly') {
			return overview.weekly.map((item) => ({
				x: item.day || '',
				y: Number(item.revenue || (item as any).amount || 0)
			}));
		} else if (activeChartTab === 'monthly') {
			return overview.monthly.map((item) => ({
				x: item.week || '',
				y: Number(item.revenue || (item as any).amount || 0)
			}));
		} else {
			return overview.yearly.map((item) => ({
				x: item.month || '',
				y: Number(item.revenue || (item as any).amount || 0)
			}));
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

	const stats = $derived(
		dashboardData
			? [
					{
						title: 'Total Revenue',
						value: formatCurrency(300),
						icon: DollarSign,
						color: 'text-senary',
						bg: 'bg-senary/10'
					},
					{
						title: 'Total Reservations',
						value: 300,
						icon: CalendarCheck,
						color: 'text-blue-400',
						bg: 'bg-blue-400/10'
					},
					{
						title: 'Active Barbers',
						value: 44,
						icon: Scissors,
						color: 'text-purple-400',
						bg: 'bg-purple-400/10'
					}
				]
			: []
	);
</script>

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30">
	<AdminHeader pageName="Dashboard" description="Overview of your barbershop performance" />

	<div class="px-6 py-6 lg:px-8">
		<div class="mx-auto max-w-7xl space-y-8">
			{#if isLoading}
				<div class="flex h-[400px] items-center justify-center">
					<div
						class="h-8 w-8 animate-spin rounded-full border-2 border-senary border-t-transparent"
					></div>
				</div>
			{:else if dashboardData}
				<!-- Stats Grid -->
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each stats as stat}
						<div
							class="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-senary/30 hover:bg-white/10 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]"
						>
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium text-secondary/60 uppercase tracking-wider">
										{stat.title}
									</p>
									<h3
										class="mt-2 text-3xl font-light text-secondary group-hover:text-senary transition-colors"
									>
										{stat.value}
									</h3>
								</div>
								<div class={`rounded-2xl p-4 ${stat.bg} ${stat.color}`}>
									<stat.icon class="h-6 w-6" />
								</div>
							</div>
						</div>
					{/each}
				</div>

				<div class="grid gap-6 lg:grid-cols-3">
					<!-- Revenue Chart -->
					<div
						class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-2"
					>
						<div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div>
								<h3 class="text-xl font-bold text-white">Revenue Overview</h3>
								<p class="text-sm text-secondary/60">Financial performance analytics</p>
							</div>
							<div class="flex bg-black/20 p-1 rounded-xl border border-white/5">
								{#each ['weekly', 'monthly', 'yearly'] as tab}
									<button
										class={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeChartTab === tab ? 'bg-senary text-primary shadow-lg' : 'text-secondary/60 hover:text-secondary hover:bg-white/5'}`}
										onclick={() => (activeChartTab = tab)}
									>
										{tab.charAt(0).toUpperCase() + tab.slice(1)}
									</button>
								{/each}
							</div>
						</div>
						<div class="h-[350px] w-full">
							<Chart
								data={chartData}
								x="x"
								y="y"
								xScale={scaleBand().padding(0.4)}
								yDomain={[0, Math.max(1000000, ...chartData.map((d) => d.y))]}
								padding={{ left: 16, bottom: 24, right: 16, top: 16 }}
							>
								<Svg>
									<Axis
										placement="left"
										grid
										rule
										class="stroke-white/30 fill-[#F5F5DC] text-[10px]"
										format={(v) => formatCurrency(v).replace('Rp', '')}
									/>
									<Axis placement="bottom" rule class="stroke-white/30 fill-[#F5F5DC] text-xs" />
									<Bars
										radius={6}
										strokeWidth={0}
										class="fill-senary transition-all hover:fill-senary/80"
									/>
								</Svg>
								<Tooltip.Root let:data>
									<Tooltip.Header class="text-secondary font-bold">{data.x}</Tooltip.Header>
									<Tooltip.List>
										<Tooltip.Item
											label="Revenue"
											value={data.y}
											format="currency"
											class="text-senary"
										/>
									</Tooltip.List>
								</Tooltip.Root>
							</Chart>
						</div>
					</div>

					<!-- Upcoming & Pending -->
					<div class="space-y-6">
						<!-- Pending Corrections -->
						<div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md h-fit">
							<div class="mb-4 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<AlertCircle class="h-5 w-5 text-yellow-500" />
									<h3 class="text-lg font-bold text-white">Needs Attention</h3>
								</div>
								<Badge
									variant="outline"
									class="border-yellow-500/20 text-yellow-500 bg-yellow-500/10"
								>
									{dashboardData.general.pendingCorrections.length}
								</Badge>
							</div>
							<ScrollArea class="h-[200px] pr-4">
								<div class="space-y-3">
									{#each dashboardData.general.pendingCorrections as item}
										<div
											class="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3"
										>
											<div>
												<p class="font-medium text-secondary text-sm">{item.customerName}</p>
												<p class="text-xs text-secondary/50 capitalize">
													{item.status.replace(/([A-Z])/g, ' $1').trim()}
												</p>
											</div>
											<div class="text-right">
												<p class="text-xs font-medium text-senary">{item.time}</p>
												<p class="text-[10px] text-secondary/40">
													{format(new Date(item.date), 'dd MMM')}
												</p>
											</div>
										</div>
									{/each}
									{#if dashboardData.general.pendingCorrections.length === 0}
										<p class="text-center text-xs text-secondary/40 py-4">No pending corrections</p>
									{/if}
								</div>
							</ScrollArea>
						</div>

						<!-- Upcoming -->
						<div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md h-fit">
							<div class="mb-4 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<CalendarDays class="h-5 w-5 text-blue-400" />
									<h3 class="text-lg font-bold text-white">Upcoming</h3>
								</div>
								<Badge variant="outline" class="border-blue-400/20 text-blue-400 bg-blue-400/10">
									{dashboardData.general.upcomingReservations.length}
								</Badge>
							</div>
							<ScrollArea class="h-[200px] pr-4">
								<div class="space-y-3">
									{#each dashboardData.general.upcomingReservations as item}
										<div
											class="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3"
										>
											<div>
												<p class="font-medium text-secondary text-sm">{item.customerName}</p>
												<p class="text-xs text-secondary/50">{item.serviceName}</p>
											</div>
											<div class="text-right">
												<p class="text-xs font-medium text-blue-400">{item.time}</p>
												<p class="text-[10px] text-secondary/40">
													{format(new Date(item.date), 'dd MMM')}
												</p>
											</div>
										</div>
									{/each}
									{#if dashboardData.general.upcomingReservations.length === 0}
										<p class="text-center text-xs text-secondary/40 py-4">
											No upcoming reservations
										</p>
									{/if}
								</div>
							</ScrollArea>
						</div>
					</div>
				</div>

				<!-- Recent Reservations Table -->
				<div class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
					<div class="mb-6 flex items-center justify-between">
						<div>
							<h3 class="text-xl font-bold text-white">Recent Reservations</h3>
							<p class="text-sm text-secondary/60">Latest bookings from customers</p>
						</div>
						<Button
							variant="outline"
							href="/a1-portal-a16-tlb/Reservation"
							class="border-senary/50 text-senary hover:bg-senary hover:text-primary"
						>
							View All
						</Button>
					</div>

					<div class="overflow-hidden rounded-xl border border-white/5 bg-black/20">
						<table class="w-full text-left text-sm">
							<thead class="bg-white/5 text-secondary/60">
								<tr>
									<th class="px-6 py-4 font-medium">Customer</th>
									<th class="px-6 py-4 font-medium">Service</th>
									<th class="px-6 py-4 font-medium">Barber</th>
									<th class="px-6 py-4 font-medium">Date & Time</th>
									<th class="px-6 py-4 font-medium">Status</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-white/5">
								{#each dashboardData.general.recentReservations as reservation}
									<tr class="hover:bg-white/5 transition-colors">
										<td class="px-6 py-4">
											<div class="flex items-center gap-3">
												<div
													class="flex h-8 w-8 items-center justify-center rounded-full bg-senary/10 text-xs font-bold text-senary"
												>
													{reservation.customerName.charAt(0)}
												</div>
												<span class="font-medium text-secondary">{reservation.customerName}</span>
											</div>
										</td>
										<td class="px-6 py-4 text-secondary/80">{reservation.serviceName}</td>
										<td class="px-6 py-4 text-secondary/80">{reservation.barberName}</td>
										<td class="px-6 py-4">
											<div class="flex flex-col">
												<span class="text-secondary"
													>{format(new Date(reservation.date), 'dd MMM yyyy')}</span
												>
												<span class="text-xs text-secondary/50">{reservation.time}</span>
											</div>
										</td>
										<td class="px-6 py-4">
											<Badge
												variant="outline"
												class={reservation.status === 'completed'
													? 'border-green-500/20 text-green-500 bg-green-500/10'
													: reservation.status === 'pending'
														? 'border-yellow-500/20 text-yellow-500 bg-yellow-500/10'
														: reservation.status === 'confirmed'
															? 'border-blue-500/20 text-blue-500 bg-blue-500/10'
															: 'border-red-500/20 text-red-500 bg-red-500/10'}
											>
												{reservation.status}
											</Badge>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
