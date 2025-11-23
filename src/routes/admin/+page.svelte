<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { scaleBand } from 'd3-scale';
	import { BarChart } from 'layerchart';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import { getLatestWaitingReservations, getReservations } from '$lib/api/admin/reservation';
	import { Check, X, MessageCircle, Eye, Wallet, Users } from 'lucide-svelte';
	import StatsCard from '$lib/components/Admin/Statistics/StatsCard.svelte';
	import { processChartData, type Period } from '$lib/utils/dashboard';

	// Data Fetching
	const latestReservation = getLatestWaitingReservations();
	const allReservations = getReservations().reservations;

	// State
	let activeChart = $state<Period>('weekly');

	// Reactive Data Processing
	const dashboardData = $derived(processChartData(allReservations, activeChart));
	const chartData = $derived(dashboardData.chartData);
	const stats = $derived(dashboardData.stats);

	// Chart Configuration
	const chartConfig = {
		weekly: {
			label: 'Weekly',
			color: 'var(--chart-1)',
			icon: MonitorIcon,
			theme: { light: '#2563eb', dark: '#93c5fd' }
		},
		monthly: {
			label: 'Monthly',
			color: 'var(--chart-2)',
			icon: MonitorIcon,
			theme: { light: '#059669', dark: '#6ee7b7' }
		},
		yearly: {
			label: 'Yearly',
			color: 'var(--chart-3)',
			icon: MonitorIcon,
			theme: { light: '#7c3aed', dark: '#c4b5fd' }
		}
	} satisfies Chart.ChartConfig;
</script>

<div class="space-y-8 p-6">
	<!-- Summary Cards -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<StatsCard
			title="Reservation Income"
			value={`Rp ${stats.totalIncome.toLocaleString()}`}
			icon={Wallet}
			trend={stats.incomeTrend}
		/>
		<StatsCard
			title="Total Reservations"
			value={stats.totalCustomers}
			icon={Users}
			trend={stats.customerTrend}
		/>
	</div>

	<!-- Chart -->
	<div class="admin-glass-panel p-6">
		<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<h2 class="text-lg font-semibold text-gray-800">Income Overview</h2>

			<!-- Chart Toggle Tabs -->
			<div class="flex overflow-hidden rounded-lg border border-gray-200 bg-gray-100/50 p-1">
				{#each ['weekly', 'monthly', 'yearly'] as key}
					{@const chart = key as keyof typeof chartConfig}
					<button
						data-active={activeChart === chart}
						class="rounded-md px-4 py-1.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900 data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:shadow-sm"
						onclick={() => (activeChart = chart)}
					>
						{chartConfig[chart].label}
					</button>
				{/each}
			</div>
		</div>

		<Chart.Container config={chartConfig} class="h-[300px] w-full">
			<BarChart
				data={chartData}
				xScale={scaleBand().padding(0.3)}
				x="xAxis"
				seriesLayout="group"
				legend
				series={[
					{
						key: 'income',
						label: 'Income (Rp)',
						color: '#3B82F6' // Blue for income
					},
					{
						key: 'customer',
						label: 'Customers',
						color: '#8B5CF6' // Purple for customers
					}
				]}
				props={{
					bars: {
						fillOpacity: 0.8,
						strokeWidth: 0,
						radius: 4
					},
					xAxis: {
						format: (d) => {
							if (activeChart === 'weekly') return d.slice(0, 3);
							if (activeChart === 'monthly') return d.slice(0, 3);
							return d;
						},
						tickSize: 0,
						tickPadding: 10
					},
					yAxis: {
						tickSize: 0,
						tickPadding: 10,
						grid: true,
						gridColor: '#E5E7EB'
					},
					tooltip: {
						header: (value) => value.xAxis,
						format: (point) => {
							if (point.series.key === 'income') {
								return `Rp ${point.value.toLocaleString()}`;
							}
							return point.value;
						}
					}
				}}
			>
				{#snippet tooltip()}
					<Chart.Tooltip
						class="rounded-xl border border-white/50 bg-white/80 p-3 shadow-lg backdrop-blur-md"
						contentClass="text-sm font-medium text-gray-700"
					/>
				{/snippet}
			</BarChart>
		</Chart.Container>
	</div>

	<!-- Latest Reservations -->
	<div>
		<h2 class="mb-4 text-lg font-semibold text-gray-800">Latest Reservation Update</h2>

		{#if latestReservation.length === 0}
			<p class="text-muted-foreground italic">No pending reservations.</p>
		{:else}
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
				{#each latestReservation as reservation}
					<div
						class="group relative flex items-center justify-between overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-md"
					>
						<div class="flex flex-col">
							<div class="mb-1 flex items-center gap-2">
								<span class="text-xs font-medium tracking-wider text-gray-500 uppercase">
									{reservation.status || 'Request new reservation'}
								</span>
							</div>
							<h3 class="text-lg font-bold text-gray-900">{reservation.dateTime}</h3>
							<p class="text-sm text-gray-600">{reservation.customer}</p>
						</div>

						<div class="flex gap-1 opacity-80 transition-opacity group-hover:opacity-100">
							<button
								class="rounded-lg bg-white/50 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
								aria-label="Reject"
							>
								<X class="h-4 w-4" />
							</button>
							<button
								class="rounded-lg bg-white/50 p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
								aria-label="View"
							>
								<Eye class="h-4 w-4" />
							</button>
							<button
								class="rounded-lg bg-white/50 p-2 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
								aria-label="Message"
							>
								<MessageCircle class="h-4 w-4" />
							</button>
							<button
								class="rounded-lg bg-white/50 p-2 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white"
								aria-label="Approve"
							>
								<Check class="h-4 w-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.layerchart-legend-item) {
		margin-right: 1.5rem;
		font-size: 0.875rem;
		color: #6b7280;
	}
	:global(.layerchart-legend) {
		margin-top: 1.5rem;
	}
</style>
