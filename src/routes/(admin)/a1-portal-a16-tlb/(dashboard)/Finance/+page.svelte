<script lang="ts">
	import { 
		DollarSign, 
		TrendingUp, 
		TrendingDown, 
		Search,
		Plus,
		Filter,
		Download,
		MoreHorizontal,
		ArrowUpRight,
		ArrowDownRight,
		Wallet,
		CreditCard,
		Calendar as CalendarIcon,
		X
	} from 'lucide-svelte';
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Table from "$lib/components/ui/table";
	import * as Tabs from "$lib/components/ui/tabs";
	import * as Select from "$lib/components/ui/select";
	import * as Popover from "$lib/components/ui/popover";
	import { Calendar } from "$lib/components/ui/calendar";
	import IncomeModal from './IncomeModal.svelte';
	import ExpenseModal from './ExpenseModal.svelte';
	import GroupedBars from '$lib/components/Admin/finance/GroupedBars.svelte';
	import { 
		getCashFlowStats, 
		getUnifiedIncome, 
		getExpenses,
		type UnifiedIncomeItem,
		type OfflineIncome, // Keep for Modal type compatibility
		type Expense,
		type CashFlowStats
	} from '$lib/api/admin/finance';
	import { toast } from "svelte-sonner";
	import { cn } from "$lib/utils";
	import { DateFormatter, type DateValue, getLocalTimeZone } from "@internationalized/date";
	import { scaleBand } from 'd3-scale';
	import { Chart, Svg, Axis, Bars, Tooltip, Line, Points } from 'layerchart';

	let { data } = $props();
	let token = $derived(data.session?.access_token || '');

	// Updated initial state to match new structure
	let stats: CashFlowStats = $state({
		daily: { 
			revenue: { total: 0, online: { total: 0, downPayment: 0, settlement: 0 }, offline: { total: 0, cash: 0, qris: 0 } }, 
			expenses: { total: 0 }, 
			netProfit: 0 
		},
		weekly: { 
			revenue: { total: 0, online: { total: 0, downPayment: 0, settlement: 0 }, offline: { total: 0, cash: 0, qris: 0 } }, 
			expenses: { total: 0 }, 
			netProfit: 0 
		},
		monthly: { 
			revenue: { total: 0, online: { total: 0, downPayment: 0, settlement: 0 }, offline: { total: 0, cash: 0, qris: 0 } }, 
			expenses: { total: 0 }, 
			netProfit: 0 
		},
		charts: { weekly: [], monthly: [], yearly: [] }
	});

	let incomeRecords: UnifiedIncomeItem[] = $state([]);
	let expenseRecords: Expense[] = $state([]);
	let isLoading = $state(true);
	let searchQuery = $state('');
	let activeChartTab = $state('weekly');
	


	// Filters
	let startDate = $state<DateValue | undefined>(undefined);
	let endDate = $state<DateValue | undefined>(undefined);
	let selectedCategory = $state<string>('All Categories');

	let incomeModalOpen = $state(false);
	let selectedIncome: OfflineIncome | null = $state(null); // Keep handling OfflineIncome for edits if we re-fetch

	let expenseModalOpen = $state(false);
	let selectedExpense: Expense | null = $state(null);

	const df = new DateFormatter("en-US", {
		dateStyle: "medium"
	});

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(dateString: string) {
		return df.format(new Date(dateString));
	}

	async function loadData() {
		if (!token) return;
		isLoading = true;
		
		const startDateStr = startDate ? startDate.toString() : undefined;
		const endDateStr = endDate ? endDate.toString() : undefined;

		try {
			const [statsData, incomeData, expenseData] = await Promise.all([
				getCashFlowStats(fetch, token),
				getUnifiedIncome(fetch, token, startDateStr, endDateStr),
				getExpenses(fetch, token, startDateStr, endDateStr)
			]);

			if (statsData?.data) stats = statsData.data;
			if (incomeData?.data) incomeRecords = incomeData.data;
			if (expenseData?.data) expenseRecords = expenseData.data;
		} catch (error) {
			console.error('Error loading finance data:', error);
			toast.error("Failed to load finance data");
		} finally {
			isLoading = false;
		}
	}

	// Chart Data Transformation
	const chartData = $derived.by(() => {
		if (!stats.charts) return [];
		
		if (activeChartTab === 'weekly') {
			return stats.charts.weekly.map(item => ({
				x: item.label,
				revenue: item.revenue,
				expenses: item.expenses
			}));
		} else if (activeChartTab === 'monthly') {
			return stats.charts.monthly.map(item => ({
				x: item.label,
				revenue: item.revenue,
				expenses: item.expenses
			}));
		} else {
			return stats.charts.yearly.map(item => ({
				x: item.label,
				revenue: item.revenue,
				expenses: item.expenses
			}));
		}
	});

	function openCreateIncome() {
		selectedIncome = null;
		incomeModalOpen = true;
	}

	// Disable edit for now in Unified View, or only allow if we can check it's offline
	// For simplicity in this step, we just provide Create
	
	function openCreateExpense() {
		selectedExpense = null;
		expenseModalOpen = true;
	}

	function openEditExpense(expense: Expense) {
		selectedExpense = expense;
		expenseModalOpen = true;
	}

	async function handleIncomeSuccess() {
		await loadData();
		incomeModalOpen = false;
	}

	async function handleExpenseSuccess() {
		await loadData();
		expenseModalOpen = false;
	}

	// Search filtering
	let filteredIncome = $derived(incomeRecords.filter(item => 
		item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.source.toLowerCase().includes(searchQuery.toLowerCase())
	));

	let filteredExpenses = $derived(expenseRecords.filter(item => {
		const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
		
		const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
		
		return matchesSearch && matchesCategory;
	}));

	$effect(() => {
		if (token) {
			loadData();
		}
	});

	// Trigger reload when dates change
	$effect(() => {
		if (startDate || endDate) {
			// Debounce could be added here if needed, but for now direct reload is fine for simplicity
			loadData();
		}
	});

	function clearFilters() {
		startDate = undefined;
		endDate = undefined;
		selectedCategory = 'All Categories';
		searchQuery = '';
		loadData();
	}
</script>

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30 pb-20">
	<!-- Compact Hero Header -->
	<div class="relative w-full overflow-hidden px-8 pt-6 pb-2">
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"></div>
		
		<div class="relative z-10 mx-auto max-w-[1600px]">
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="h-[1px] w-12 bg-senary"></div>
					<p class="text-sm font-medium tracking-[0.3em] text-senary uppercase">Admin Portal</p>
				</div>
				<div class="text-right">
					<p class="text-3xl font-bold text-senary">{formatCurrency(stats.monthly.netProfit)}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Monthly Net Profit</p>
				</div>
			</div>

			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Finance <span class="text-senary">Overview</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Track your salon's financial pulse. Income, expenses, and cash flow analysis.
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8 mt-6">
		<div class="mx-auto max-w-[1600px] space-y-6">
			
			<!-- Financial Chart -->
			<div class="rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-md">
				<div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h3 class="text-xl font-bold text-white">Financial Trends</h3>
						<p class="text-sm text-secondary/60">Revenue and expense analysis</p>
					</div>
					<div class="flex bg-white/5 p-1 rounded-xl border border-white/5">
						{#each ['weekly', 'monthly', 'yearly'] as tab}
							<button
								class={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeChartTab === tab ? 'bg-senary text-primary shadow-lg' : 'text-secondary/60 hover:text-secondary hover:bg-white/5'}`}
								onclick={() => activeChartTab = tab}
							>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						{/each}
					</div>
				</div>
				<div class="h-[300px] w-full">
					<Chart
						data={chartData}
						x="x"
						y="revenue"
						xScale={scaleBand().padding(0.4)}
						yDomain={
							activeChartTab === 'weekly' ? [0, 600000] :
							activeChartTab === 'monthly' ? [0, 5000000] :
							[0, 35000000]
						}
						padding={{ left: 80, bottom: 24, right: 16, top: 16 }}
					>
						<Svg>
							<Axis placement="left" grid rule class="stroke-white/10 fill-white text-[10px]" format={(v) => formatCurrency(v).replace('Rp', '')} />
							<Axis placement="bottom" rule class="stroke-white/10 fill-white text-xs" />
							
							<GroupedBars data={chartData} />
						</Svg>
						<Tooltip.Root let:data>
							<Tooltip.Header class="text-secondary font-bold">{data.x}</Tooltip.Header>
							<Tooltip.List>
								<Tooltip.Item label="Revenue" value={data.revenue} format="currency" class="text-senary" />
								<Tooltip.Item label="Expenses" value={data.expenses} format="currency" class="text-red-500" />
							</Tooltip.List>
						</Tooltip.Root>
					</Chart>
				</div>
			</div>

			<!-- Date Filter & Detailed Stats -->
			<div class="space-y-6">
				<Tabs.Root value="daily" class="w-full">
					<div class="flex items-center justify-between mb-4">
						<Tabs.List class="bg-white/5 border border-white/10">
							<Tabs.Trigger value="daily" class="data-[state=active]:bg-senary data-[state=active]:text-primary">Daily Overview</Tabs.Trigger>
							<Tabs.Trigger value="monthly" class="data-[state=active]:bg-senary data-[state=active]:text-primary">Monthly Overview</Tabs.Trigger>
						</Tabs.List>
					</div>

					<!-- Daily Tab -->
					<Tabs.Content value="daily" class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<!-- Revenue Breakdown -->
							<div class="md:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
								<div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
								<div class="flex items-center justify-between mb-6 relative">
									<div class="flex items-center gap-3">
										<div class="p-2 rounded-xl bg-green-500/10 text-green-500">
											<TrendingUp class="h-5 w-5" />
										</div>
										<div>
											<h3 class="text-sm font-bold text-white uppercase tracking-widest">Revenue Breakdown</h3>
											<p class="text-[10px] text-secondary/60">Comprehensive income analysis</p>
										</div>
									</div>
									<div class="text-right">
										<p class="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.daily.revenue.total)}</p>
										<p class="text-[10px] font-bold text-green-500 uppercase tracking-widest">Total Revenue</p>
									</div>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
									<!-- Online Channel -->
									<div class="space-y-4">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-xs font-bold text-secondary uppercase tracking-wider">Online Channel</span>
											<span class="text-sm font-bold text-white">{formatCurrency(stats.daily.revenue.online.total)}</span>
										</div>
										<div class="space-y-3">
											<div class="flex justify-between items-center">
												<span class="text-[10px] text-secondary/60">Down Payments</span>
												<span class="text-xs font-medium text-secondary">{formatCurrency(stats.daily.revenue.online.downPayment)}</span>
											</div>
											<div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-500/50 rounded-full" style="width: {stats.daily.revenue.online.total ? (stats.daily.revenue.online.downPayment / stats.daily.revenue.online.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-[10px] text-secondary/60">Settlements</span>
												<span class="text-xs font-medium text-secondary">{formatCurrency(stats.daily.revenue.online.settlement)}</span>
											</div>
											<div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-400/50 rounded-full" style="width: {stats.daily.revenue.online.total ? (stats.daily.revenue.online.settlement / stats.daily.revenue.online.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>

									<!-- Offline Channel -->
									<div class="space-y-4">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-xs font-bold text-secondary uppercase tracking-wider">Offline Channel</span>
											<span class="text-sm font-bold text-white">{formatCurrency(stats.daily.revenue.offline.total)}</span>
										</div>
										<div class="space-y-3">
											<div class="flex justify-between items-center">
												<span class="text-[10px] text-secondary/60">Cash (Tunai)</span>
												<span class="text-xs font-medium text-secondary">{formatCurrency(stats.daily.revenue.offline.cash)}</span>
											</div>
											<div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-green-500/50 rounded-full" style="width: {stats.daily.revenue.offline.total ? (stats.daily.revenue.offline.cash / stats.daily.revenue.offline.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-[10px] text-secondary/60">QRIS</span>
												<span class="text-xs font-medium text-secondary">{formatCurrency(stats.daily.revenue.offline.qris)}</span>
											</div>
											<div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-purple-500/50 rounded-full" style="width: {stats.daily.revenue.offline.total ? (stats.daily.revenue.offline.qris / stats.daily.revenue.offline.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Summary Stats -->
							<div class="grid grid-rows-2 gap-4">
								<!-- Expenses -->
								<div class="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
									<div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
									<div class="flex items-center gap-3 relative">
										<div class="p-2 rounded-xl bg-red-500/10 text-red-500">
											<TrendingDown class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-white uppercase tracking-widest">Total Expenses</h3>
									</div>
									<div class="text-right relative">
										<p class="text-2xl font-bold text-white tracking-tight">{formatCurrency(stats.daily.expenses.total)}</p>
										<p class="text-[10px] text-secondary/60">Operational costs</p>
									</div>
								</div>

								<!-- Net Profit -->
								<div class="bg-gradient-to-br from-senary/10 to-black/60 border border-senary/20 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
									<div class="flex items-center gap-3 relative">
										<div class="p-2 rounded-xl bg-senary/20 text-senary">
											<Wallet class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-senary uppercase tracking-widest">Net Profit</h3>
									</div>
									<div class="text-right relative">
										<p class="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.daily.netProfit)}</p>
										<p class="text-[10px] font-bold text-senary/80 uppercase tracking-widest">Daily Earnings</p>
									</div>
								</div>
							</div>
						</div>
					</Tabs.Content>

					<!-- Monthly Tab -->
					<Tabs.Content value="monthly" class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<!-- Revenue Breakdown -->
							<div class="md:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
								<div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
								<div class="flex items-center justify-between mb-6 relative">
									<div class="flex items-center gap-3">
										<div class="p-2 rounded-xl bg-blue-500/10 text-blue-500">
											<TrendingUp class="h-5 w-5" />
										</div>
										<div>
											<h3 class="text-sm font-bold text-white uppercase tracking-widest">Revenue Breakdown</h3>
											<p class="text-[10px] text-secondary/60">Monthly income analysis</p>
										</div>
									</div>
									<div class="text-right">
										<p class="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.monthly.revenue.total)}</p>
										<p class="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Total Revenue</p>
									</div>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
									<!-- Online Channel -->
									<div class="space-y-4">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-xs font-bold text-secondary uppercase tracking-wider">Online Channel</span>
											<span class="text-sm font-bold text-white">{formatCurrency(stats.monthly.revenue.online.total)}</span>
										</div>
										<div class="space-y-3">
											<div class="flex justify-between items-center">
												<span class="text-[10px] text-secondary/60">Down Payments</span>
												<span class="text-xs font-medium text-secondary">{formatCurrency(stats.monthly.revenue.online.downPayment)}</span>
											</div>
											<div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-500/50 rounded-full" style="width: {stats.monthly.revenue.online.total ? (stats.monthly.revenue.online.downPayment / stats.monthly.revenue.online.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-[10px] text-secondary/60">Settlements</span>
												<span class="text-xs font-medium text-secondary">{formatCurrency(stats.monthly.revenue.online.settlement)}</span>
											</div>
											<div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-400/50 rounded-full" style="width: {stats.monthly.revenue.online.total ? (stats.monthly.revenue.online.settlement / stats.monthly.revenue.online.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>

									<!-- Offline Channel -->
									<div class="space-y-4">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-xs font-bold text-secondary uppercase tracking-wider">Offline Channel</span>
											<span class="text-sm font-bold text-white">{formatCurrency(stats.monthly.revenue.offline.total)}</span>
										</div>
										<div class="space-y-3">
											<div class="flex justify-between items-center">
												<span class="text-[10px] text-secondary/60">Cash (Tunai)</span>
												<span class="text-xs font-medium text-secondary">{formatCurrency(stats.monthly.revenue.offline.cash)}</span>
											</div>
											<div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-green-500/50 rounded-full" style="width: {stats.monthly.revenue.offline.total ? (stats.monthly.revenue.offline.cash / stats.monthly.revenue.offline.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-[10px] text-secondary/60">QRIS</span>
												<span class="text-xs font-medium text-secondary">{formatCurrency(stats.monthly.revenue.offline.qris)}</span>
											</div>
											<div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-purple-500/50 rounded-full" style="width: {stats.monthly.revenue.offline.total ? (stats.monthly.revenue.offline.qris / stats.monthly.revenue.offline.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Summary Stats -->
							<div class="grid grid-rows-2 gap-4">
								<!-- Expenses -->
								<div class="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
									<div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
									<div class="flex items-center gap-3 relative">
										<div class="p-2 rounded-xl bg-red-500/10 text-red-500">
											<TrendingDown class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-white uppercase tracking-widest">Total Expenses</h3>
									</div>
									<div class="text-right relative">
										<p class="text-2xl font-bold text-white tracking-tight">{formatCurrency(stats.monthly.expenses.total)}</p>
										<p class="text-[10px] text-secondary/60">Operational costs</p>
									</div>
								</div>

								<!-- Net Profit -->
								<div class="bg-gradient-to-br from-senary/10 to-black/60 border border-senary/20 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
									<div class="flex items-center gap-3 relative">
										<div class="p-2 rounded-xl bg-senary/20 text-senary">
											<Wallet class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-senary uppercase tracking-widest">Net Profit</h3>
									</div>
									<div class="text-right relative">
										<p class="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.monthly.netProfit)}</p>
										<p class="text-[10px] font-bold text-senary/80 uppercase tracking-widest">Monthly Earnings</p>
									</div>
								</div>
							</div>
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>

			<!-- Controls -->
			<div class="flex flex-col xl:flex-row gap-4 justify-between sticky top-0 z-20 py-4 bg-slate-950/95 backdrop-blur-sm -mx-2 px-2 border-b border-white/5">
				<div class="flex flex-wrap gap-2 items-center w-full xl:w-auto">
					<!-- Search -->
					<div class="relative w-full sm:w-64">
						<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-secondary/50" />
						<Input
							placeholder="Search records..."
							bind:value={searchQuery}
							class="h-9 rounded-xl border-white/10 bg-white/5 pl-10 text-secondary placeholder:text-secondary/50 focus:border-senary focus:ring-senary text-xs w-full"
						/>
					</div>

					<!-- Date Filters -->
					<Popover.Root>
						<Popover.Trigger asChild>
							{#snippet child({ props })}
								<Button
									variant="outline"
									class={cn(
										"h-9 justify-start text-left font-normal border-white/10 bg-white/5 text-xs w-[130px]",
										!startDate && "text-muted-foreground"
									)}
									{...props}
								>
									<CalendarIcon class="mr-2 h-3.5 w-3.5" />
									{startDate ? df.format(startDate.toDate(getLocalTimeZone())) : "Start Date"}
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10">
							<Calendar bind:value={startDate} type="single" initialFocus class="p-3 text-secondary"/>
						</Popover.Content>
					</Popover.Root>

					<Popover.Root>
						<Popover.Trigger asChild>
							{#snippet child({ props })}
								<Button
									variant="outline"
									class={cn(
										"h-9 justify-start text-left font-normal border-white/10 bg-white/5 text-xs w-[130px]",
										!endDate && "text-muted-foreground"
									)}
									{...props}
								>
									<CalendarIcon class="mr-2 h-3.5 w-3.5" />
									{endDate ? df.format(endDate.toDate(getLocalTimeZone())) : "End Date"}
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10">
							<Calendar bind:value={endDate} type="single" initialFocus class="p-3 text-secondary"/>
						</Popover.Content>
					</Popover.Root>

					<!-- Category Filter -->
					<div class="w-[160px]">
						<Select.Root 
							selected={{ value: selectedCategory, label: selectedCategory }}
							onSelectedChange={(v) => {
								if (v) selectedCategory = v.value as string;
							}}
						>
							<Select.Trigger class="h-9 rounded-xl border-white/10 bg-white/5 text-xs text-secondary hover:bg-white/10 hover:text-white transition-colors">
								<Select.Value placeholder="Category" />
							</Select.Trigger>
							<Select.Content class="bg-slate-950 border-white/10 text-secondary">
								<Select.Item value="All Categories" label="All Categories" class="text-xs hover:bg-white/5 cursor-pointer">All Categories</Select.Item>
								{#each ['Payroll & Staffing', 'Consumables / Supplies', 'Maintenance & Repairs', 'Marketing & Promotion', 'Utilities', 'General', 'Other'] as category}
									<Select.Item value={category} label={category} class="text-xs hover:bg-white/5 cursor-pointer">
										{category}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					{#if startDate || endDate || selectedCategory !== 'All Categories' || searchQuery}
						<Button variant="ghost" size="sm" onclick={clearFilters} class="h-9 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30">
							<X class="h-3.5 w-3.5 mr-1" /> Clear
						</Button>
					{/if}
				</div>

				<div class="flex gap-2 w-full xl:w-auto">
					<Button onclick={openCreateIncome} size="sm" class="h-9 bg-senary text-primary hover:bg-senary/90 font-bold px-4 text-xs flex-1 xl:flex-none">
						<Plus class="mr-1.5 h-3.5 w-3.5" /> Record Income
					</Button>
					<Button onclick={openCreateExpense} size="sm" class="h-9 bg-white/5 text-secondary hover:bg-white/10 border border-white/10 px-4 text-xs flex-1 xl:flex-none">
						<Plus class="mr-1.5 h-3.5 w-3.5" /> Record Expense
					</Button>
				</div>
			</div>

			<!-- Transaction Tables Grid -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
				
				<!-- Income Table -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-bold text-white">Income History</h3>
							<p class="text-xs text-secondary/60">All revenue sources (Online & Offline)</p>
						</div>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" class="h-8 text-xs border-senary/50 text-senary hover:bg-senary hover:text-primary">
								<Download class="mr-2 h-3.5 w-3.5" /> Export
							</Button>
						</div>
					</div>

					<div class="rounded-2xl border border-white/5 bg-black/40 overflow-hidden backdrop-blur-md">
						<Table.Root>
							<Table.Header>
								<Table.Row class="hover:bg-transparent border-white/5">
									<Table.Head class="text-xs font-bold uppercase tracking-wider text-secondary/50 w-[100px]">Date</Table.Head>
									<Table.Head class="text-xs font-bold uppercase tracking-wider text-secondary/50">Source</Table.Head>
									<Table.Head class="text-xs font-bold uppercase tracking-wider text-secondary/50">Description</Table.Head>
									<Table.Head class="text-xs font-bold uppercase tracking-wider text-secondary/50 text-right">Amount</Table.Head>
									<Table.Head class="w-[50px]"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each filteredIncome as item}
									<Table.Row class="hover:bg-white/5 border-white/5 transition-colors group">
										<Table.Cell class="font-medium text-secondary text-xs">
											{formatDate(item.date)}
										</Table.Cell>
										<Table.Cell>
											<span class={cn(
												"px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
												item.source === 'Online' 
													? "border-blue-500/20 bg-blue-500/10 text-blue-500" 
													: "border-green-500/20 bg-green-500/10 text-green-500"
											)}>
												{item.source}
											</span>
										</Table.Cell>
										<Table.Cell>
											<div class="flex flex-col">
												<span class="text-sm text-white">{item.description}</span>
												<span class="text-[10px] text-secondary/50">{item.type}</span>
											</div>
										</Table.Cell>
										<Table.Cell class="text-right font-medium text-senary">
											{formatCurrency(item.amount)}
										</Table.Cell>
										<Table.Cell>
											{#if item.source === 'Offline'}
												<Button variant="ghost" size="icon" class="h-8 w-8 text-secondary/40 hover:text-red-400 hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all">
													<MoreHorizontal class="h-4 w-4" />
												</Button>
											{/if}
										</Table.Cell>
									</Table.Row>
								{/each}
								{#if filteredIncome.length === 0}
									<Table.Row>
										<Table.Cell colspan={5} class="text-center py-8 text-secondary/40 text-xs">
											No income records found
										</Table.Cell>
									</Table.Row>
								{/if}
							</Table.Body>
						</Table.Root>
					</div>
				</div>

				<!-- Expense Table -->
				<div class="bg-black/40 rounded-3xl border border-white/5 backdrop-blur-md overflow-hidden flex flex-col h-[400px]">
					<div class="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 shrink-0">
						<div class="flex items-center gap-2">
							<div class="p-1.5 rounded-lg bg-red-500/10">
								<ArrowDownRight class="h-4 w-4 text-red-500" />
							</div>
							<h3 class="text-sm font-bold text-white">Expenses</h3>
						</div>
						<span class="text-[10px] text-secondary/50 bg-white/5 px-2 py-0.5 rounded-md">{filteredExpenses.length} records</span>
					</div>

					<div class="flex-1 overflow-auto custom-scrollbar p-2">
						<Table.Root>
							<Table.Header class="bg-transparent border-none">
								<Table.Row class="border-none hover:bg-transparent">
									<Table.Head class="text-secondary/40 font-bold uppercase text-[10px] pl-4 h-8 px-2">Date</Table.Head>
									<Table.Head class="text-secondary/40 font-bold uppercase text-[10px] h-8 px-2">Description</Table.Head>
									<Table.Head class="text-secondary/40 font-bold uppercase text-[10px] text-right h-8 px-4">Amount</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each filteredExpenses as item}
									<Table.Row 
										class="border-transparent hover:bg-white/5 cursor-pointer rounded-lg group"
										onclick={() => openEditExpense(item)}
									>
										<Table.Cell class="py-2 pl-4 rounded-l-lg w-[120px]">
											<span class="text-xs font-medium text-white">{formatDate(item.date)}</span>
										</Table.Cell>
										<Table.Cell class="py-2">
											<span class="text-xs text-secondary/80 line-clamp-1">{item.description}</span>
										</Table.Cell>
										<Table.Cell class="py-2 text-right pr-4 rounded-r-lg">
											<span class="text-xs font-bold text-red-400">- {formatCurrency(item.nominal)}</span>
										</Table.Cell>
									</Table.Row>
								{/each}
								{#if filteredExpenses.length === 0}
									<Table.Row>
										<Table.Cell colspan={3} class="h-32 text-center text-secondary/30 text-xs">
											No expense records found
										</Table.Cell>
									</Table.Row>
								{/if}
							</Table.Body>
						</Table.Root>
					</div>
				</div>

			</div>
		</div>
	</div>

	<!-- Modals -->
	<IncomeModal 
		bind:open={incomeModalOpen} 
		income={selectedIncome}
		onUpdate={handleIncomeSuccess}
		token={token}
	/>

	<ExpenseModal 
		bind:open={expenseModalOpen} 
		expense={selectedExpense}
		onUpdate={handleExpenseSuccess}
		token={token}
	/>
</div>

<style>
	/* Custom Scrollbar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 4px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
