<script lang="ts">
	import { 
		DollarSign, 
		TrendingUp, 
		TrendingDown, 
		Plus,
		Filter,
		Download,
		MoreHorizontal,
		Wallet,
		CreditCard,
		Calendar as CalendarIcon,
		X,
		ChevronLeft,
		ChevronRight,
		Check
	} from 'lucide-svelte';
	import { Button } from "$lib/components/ui/button";
	import * as Table from "$lib/components/ui/table";
	import * as Tabs from "$lib/components/ui/tabs";
	import * as Select from "$lib/components/ui/select";
	import * as Popover from "$lib/components/ui/popover";
	import * as Command from "$lib/components/ui/command";
	import { Calendar } from "$lib/components/ui/calendar";
	import IncomeModal from './IncomeModal.svelte';
	import ExpenseModal from './ExpenseModal.svelte';
	import GroupedBars from '$lib/components/Admin/finance/GroupedBars.svelte';
	import { 
		getCashFlowStats, 
		getUnifiedIncome, 
		getExpenses,
		type UnifiedIncomeItem,
		type OfflineIncome,
		type Expense,
		type CashFlowStats
	} from '$lib/api/admin/finance';
	import { toast } from "svelte-sonner";
	import { cn } from "$lib/utils";
	import { DateFormatter, type DateValue, getLocalTimeZone } from "@internationalized/date";
	import { scaleBand }
	from 'd3-scale';
	import { Chart, Svg, Axis, Bars, Tooltip, Rule } from 'layerchart';
	import * as Pagination from "$lib/components/ui/pagination";

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
	let activeChartTab = $state('weekly');
	
    // Chart Goal Mapping
    // weekly chart (days) -> daily goal
    // monthly chart (weeks/days) -> weekly goal (assuming weekly agg)
    // yearly chart (months) -> monthly goal
    let chartGoal = $derived.by(() => {
        if (activeChartTab === 'weekly') return PROFIT_GOALS.daily;
        if (activeChartTab === 'monthly') return PROFIT_GOALS.weekly; 
        return PROFIT_GOALS.monthly;
    });

	// Filters
	let startDate = $state<DateValue | undefined>(undefined);
	let endDate = $state<DateValue | undefined>(undefined);
	
	// Income Filter (Rebuilt to match Expense Filter)
	let selectedSource = $state<string>('All Sources');
	let incomeSourceOpen = $state(false);

	// Expense Filter (Multi Select)
	let selectedCategories = $state<string[]>(['All Categories']);
	let expenseCategoryOpen = $state(false);

	let incomeModalOpen = $state(false);
	let selectedIncome: OfflineIncome | null = $state(null); 

	let expenseModalOpen = $state(false);
	let selectedExpense: Expense | null = $state(null);

	// Pagination State
	const ITEMS_PER_PAGE = 5;
	let incomePage = $state(1);
	let expensePage = $state(1);

	const df = new DateFormatter("en-US", {
		dateStyle: "medium"
	});


	const categories = [
		'Payroll & Staffing', 
		'Consumables / Supplies', 
		'Maintenance & Repairs', 
		'Marketing & Promotion', 
		'Utilities', 
		'General', 
		'Other'
	];

    const PROFIT_GOALS = {
        daily: { min: 100000, max: 500000 },
        weekly: { min: 500000, max: 1000000 },
        monthly: { min: 2000000, max: 5000000 }
    };

    function calculateProgress(value: number, max: number) {
        if (value <= 0) return 0;
        return Math.min((value / max) * 100, 100);
    }
	
	const sources = ['Online', 'Offline'];

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

	const maxY = $derived.by(() => {
		const maxVal = Math.max(
			...chartData.map(d => Math.max(d.revenue, d.expenses)),
			1000 
		);
		return maxVal * 1.1; 
	});

	function openCreateIncome() {
		selectedIncome = null;
		incomeModalOpen = true;
	}
	
	function openCreateExpense() {
		selectedExpense = null;
		expenseModalOpen = true;
	}

	function openEditExpense(expense: Expense) {
		selectedExpense = expense;
		expenseModalOpen = true;
	}

	function openEditIncome(item: UnifiedIncomeItem) {
		if (item.source === 'Online') {
			toast.info("Online transactions cannot be edited manually.");
			return;
		}

		selectedIncome = {
			id: item.id,
			date: item.date,
			type: item.type,
			service: { 
				id: '', 
				name: item.description, 
				price: item.amount 
			}
		} as any;
		
		incomeModalOpen = true;
	}

	async function handleIncomeSuccess() {
		await loadData();
		incomeModalOpen = false;
	}

	async function handleExpenseSuccess() {
		await loadData();
		expenseModalOpen = false;
	}

	// Filter Logic
	function toggleSource(source: string) {
		incomePage = 1;
		if (source === 'All Sources') {
			selectedSource = 'All Sources';
			return;
		}
		// If selecting a specific source, switch to it (single selection)
		if (selectedSource === source) {
			// If clicking already selected, maybe revert to All?
			// User request says "uncheck the all sources", implies radio behavior.
			// Let's allow toggling off to return to All.
			selectedSource = 'All Sources';
		} else {
			selectedSource = source;
		}
	}

	function toggleCategory(category: string) {
		expensePage = 1;
		
		if (category === 'All Categories') {
			selectedCategories = ['All Categories'];
			return;
		}

		let newCategories = selectedCategories.filter(c => c !== 'All Categories');

		const index = newCategories.indexOf(category);
		if (index >= 0) {
			newCategories.splice(index, 1);
		} else {
			newCategories.push(category);
		}

		if (newCategories.length === 0) {
			newCategories = ['All Categories'];
		}

		selectedCategories = newCategories;
	}

	let filteredIncome = $derived(incomeRecords.filter(item => 
		selectedSource === 'All Sources' || item.source.toLowerCase() === selectedSource.toLowerCase()
	));

	let filteredExpenses = $derived(expenseRecords.filter(item => {
		if (selectedCategories.includes('All Categories')) return true;
		return item.category && selectedCategories.includes(item.category);
	}));

	// Pagination Logic
	let paginatedIncome = $derived(filteredIncome.slice((incomePage - 1) * ITEMS_PER_PAGE, incomePage * ITEMS_PER_PAGE));
	let paginatedExpenses = $derived(filteredExpenses.slice((expensePage - 1) * ITEMS_PER_PAGE, expensePage * ITEMS_PER_PAGE));

	let totalIncomePages = $derived(Math.ceil(filteredIncome.length / ITEMS_PER_PAGE));
	let totalExpensePages = $derived(Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE));

	$effect(() => {
		if (token) {
			loadData();
		}
	});

	$effect(() => {
		if (startDate || endDate) {
			loadData(); 
		}
	});

	function clearFilters() {
		startDate = undefined;
		endDate = undefined;
		selectedCategories = ['All Categories'];
		selectedSource = 'All Sources';
		loadData();
	}
</script>

<!-- Custom tooltip now defined inline -->

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

			<div class="rounded-3xl border border-white/5 bg-black/40 p-8 backdrop-blur-md shadow-2xl">
				<div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h3 class="text-xl font-bold text-white tracking-tight">Financial Trends</h3>
						<p class="text-sm text-secondary/60 mt-1">Revenue vs Expenses analysis over time</p>
					</div>
					<div class="flex bg-white/5 p-1 rounded-xl border border-white/5">
						{#each ['weekly', 'monthly', 'yearly'] as tab}
							<button
								class={`px-5 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${activeChartTab === tab ? 'bg-senary text-primary shadow-lg scale-105' : 'text-secondary/60 hover:text-secondary hover:bg-white/5'}`}
								onclick={() => activeChartTab = tab}
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
						y="revenue"
						xScale={scaleBand().padding(0.4)}
						yDomain={[0, maxY]}
						padding={{ left: 80, bottom: 24, right: 16, top: 16 }}
					>
						{#snippet children({ context })}
							<!-- Context fixed: layerchart v2 snippet provides { context } wrapper -->
							<Svg>
								<Axis placement="left" grid rule class="stroke-white/5 fill-white text-[10px] font-mono opacity-60" format={(v) => formatCurrency(v).replace('Rp', '')} />
								<Axis placement="bottom" rule class="stroke-white/10 fill-white text-xs font-medium" />
								
                                <!-- Profit Goal Reference Lines -->
                                <Rule y={chartGoal.min} class="stroke-senary/40 stroke-[1px] [stroke-dasharray:4,4]" />
                                <Rule y={chartGoal.max} class="stroke-senary/40 stroke-[1px] [stroke-dasharray:4,4]" />

								<GroupedBars data={chartData} xScale={context.xScale} yScale={context.yScale} tooltip={context.tooltip} />
							</Svg>
						<Tooltip.Root class="!bg-transparent !border-none !shadow-none !p-0 !min-w-0 !min-h-0">
                                {#snippet children({ data })}
                                    <div class="rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md z-50 pointer-events-none">
                                        <div class="font-semibold mb-1 border-b pb-1 border-border">{data.x}</div>
                                        <div class="grid gap-1">
                                            <div class="flex items-center justify-between gap-4">
                                                <span class="text-muted-foreground text-xs">Revenue</span>
                                                <span class="font-mono font-bold text-senary">
                                                    {formatCurrency(data.revenue).replace('Rp', '').trim()}
                                                </span>
                                            </div>
                                            <div class="flex items-center justify-between gap-4">
                                                <span class="text-muted-foreground text-xs">Expenses</span>
                                                <span class="font-mono font-bold text-red-500">
                                                    {formatCurrency(data.expenses).replace('Rp', '').trim()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                {/snippet}
                            </Tooltip.Root>
						{/snippet}
					</Chart>
				</div>
			</div>

			<div class="space-y-6">
                <!-- Old location cleaned up -->
				<Tabs.Root value="daily" class="w-full">
					<div class="flex items-center justify-between mb-4">
						<Tabs.List class="bg-white/5 border border-white/10 h-10 p-1">
							<Tabs.Trigger value="daily" class="data-[state=active]:bg-senary data-[state=active]:text-primary text-xs w-32 h-8 rounded-md">Daily Overview</Tabs.Trigger>
							<Tabs.Trigger value="weekly" class="data-[state=active]:bg-senary data-[state=active]:text-primary text-xs w-32 h-8 rounded-md">Weekly Overview</Tabs.Trigger>
							<Tabs.Trigger value="monthly" class="data-[state=active]:bg-senary data-[state=active]:text-primary text-xs w-32 h-8 rounded-md">Monthly Overview</Tabs.Trigger>
						</Tabs.List>
					</div>

					<Tabs.Content value="daily" class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="md:col-span-2 bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
								<div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
								<div class="flex items-center justify-between mb-6 relative">
									<div class="flex items-center gap-3">
										<div class="p-2.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
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

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
									<div class="space-y-6">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-sm font-bold text-secondary uppercase tracking-wider">Online Channel</span>
											<span class="text-base font-bold text-white">{formatCurrency(stats.daily.revenue.online.total)}</span>
										</div>
										<div class="space-y-4">
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Down Payments</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.daily.revenue.online.downPayment)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-500/50 rounded-full" style="width: {stats.daily.revenue.online.total ? (stats.daily.revenue.online.downPayment / stats.daily.revenue.online.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Settlements</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.daily.revenue.online.settlement)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-400/50 rounded-full" style="width: {stats.daily.revenue.online.total ? (stats.daily.revenue.online.settlement / stats.daily.revenue.online.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>

									<div class="space-y-6">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-sm font-bold text-secondary uppercase tracking-wider">Offline Channel</span>
											<span class="text-base font-bold text-white">{formatCurrency(stats.daily.revenue.offline.total)}</span>
										</div>
										<div class="space-y-4">
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Cash (Tunai)</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.daily.revenue.offline.cash)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-green-500/50 rounded-full" style="width: {stats.daily.revenue.offline.total ? (stats.daily.revenue.offline.cash / stats.daily.revenue.offline.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">QRIS</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.daily.revenue.offline.qris)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-purple-500/50 rounded-full" style="width: {stats.daily.revenue.offline.total ? (stats.daily.revenue.offline.qris / stats.daily.revenue.offline.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="grid grid-rows-2 gap-4">
								<div class="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
									<div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
									<div class="flex items-center gap-3 relative">
										<div class="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
											<TrendingDown class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-white uppercase tracking-widest">Total Expenses</h3>
									</div>
									<div class="text-right relative">
										<p class="text-2xl font-bold text-white tracking-tight">{formatCurrency(stats.daily.expenses.total)}</p>
										<p class="text-[10px] text-secondary/60">Operational costs</p>
									</div>
								</div>

								<div class="bg-gradient-to-br from-senary/10 to-black/60 border border-senary/20 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
									<div class="flex items-center gap-3 relative">
										<div class="p-2.5 rounded-xl bg-senary/20 text-senary border border-senary/30">
											<Wallet class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-senary uppercase tracking-widest">Net Profit</h3>
									</div>
									<div class="text-right relative w-full pt-4">
										<p class="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.daily.netProfit)}</p>
										<p class="text-[10px] font-bold text-senary/80 uppercase tracking-widest mb-3">Daily Earnings</p>
                                        
                                        <!-- Profit Range Visualization -->
                                        <div class="space-y-1">
                                            <div class="flex justify-between text-[9px] text-secondary/50 font-medium">
                                                <span>Goal: {formatCurrency(PROFIT_GOALS.daily.min)} - {formatCurrency(PROFIT_GOALS.daily.max)}</span>
                                                <span class="{stats.daily.netProfit >= PROFIT_GOALS.daily.min ? 'text-green-500' : 'text-red-500'}">
                                                    {((stats.daily.netProfit / PROFIT_GOALS.daily.max) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    class="h-full bg-senary rounded-full transition-all duration-500" 
                                                    style="width: {calculateProgress(stats.daily.netProfit, PROFIT_GOALS.daily.max)}%"
                                                ></div>
                                            </div>
                                        </div>
									</div>
								</div>
							</div>
						</div>
					</Tabs.Content>

                    <Tabs.Content value="weekly" class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="md:col-span-2 bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
								<div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
								<div class="flex items-center justify-between mb-6 relative">
									<div class="flex items-center gap-3">
										<div class="p-2.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
											<TrendingUp class="h-5 w-5" />
										</div>
										<div>
											<h3 class="text-sm font-bold text-white uppercase tracking-widest">Revenue Breakdown</h3>
											<p class="text-[10px] text-secondary/60">Weekly income analysis</p>
										</div>
									</div>
									<div class="text-right">
										<p class="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.weekly.revenue.total)}</p>
										<p class="text-[10px] font-bold text-green-500 uppercase tracking-widest">Total Revenue</p>
									</div>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
									<div class="space-y-6">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-sm font-bold text-secondary uppercase tracking-wider">Online Channel</span>
											<span class="text-base font-bold text-white">{formatCurrency(stats.weekly.revenue.online.total)}</span>
										</div>
										<div class="space-y-4">
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Down Payments</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.weekly.revenue.online.downPayment)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-500/50 rounded-full" style="width: {stats.weekly.revenue.online.total ? (stats.weekly.revenue.online.downPayment / stats.weekly.revenue.online.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Settlements</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.weekly.revenue.online.settlement)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-400/50 rounded-full" style="width: {stats.weekly.revenue.online.total ? (stats.weekly.revenue.online.settlement / stats.weekly.revenue.online.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>

									<div class="space-y-6">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-sm font-bold text-secondary uppercase tracking-wider">Offline Channel</span>
											<span class="text-base font-bold text-white">{formatCurrency(stats.weekly.revenue.offline.total)}</span>
										</div>
										<div class="space-y-4">
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Cash (Tunai)</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.weekly.revenue.offline.cash)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-green-500/50 rounded-full" style="width: {stats.weekly.revenue.offline.total ? (stats.weekly.revenue.offline.cash / stats.weekly.revenue.offline.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">QRIS</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.weekly.revenue.offline.qris)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-purple-500/50 rounded-full" style="width: {stats.weekly.revenue.offline.total ? (stats.weekly.revenue.offline.qris / stats.weekly.revenue.offline.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="grid grid-rows-2 gap-4">
								<div class="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
									<div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
									<div class="flex items-center gap-3 relative">
										<div class="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
											<TrendingDown class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-white uppercase tracking-widest">Total Expenses</h3>
									</div>
									<div class="text-right relative">
										<p class="text-2xl font-bold text-white tracking-tight">{formatCurrency(stats.weekly.expenses.total)}</p>
										<p class="text-[10px] text-secondary/60">Operational costs</p>
									</div>
								</div>

								<div class="bg-gradient-to-br from-senary/10 to-black/60 border border-senary/20 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
									<div class="flex items-center gap-3 relative">
										<div class="p-2.5 rounded-xl bg-senary/20 text-senary border border-senary/30">
											<Wallet class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-senary uppercase tracking-widest">Net Profit</h3>
									</div>
									<div class="text-right relative w-full pt-4">
										<p class="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.weekly.netProfit)}</p>
										<p class="text-[10px] font-bold text-senary/80 uppercase tracking-widest mb-3">Weekly Earnings</p>

                                        <!-- Profit Range Visualization -->
                                        <div class="space-y-1">
                                            <div class="flex justify-between text-[9px] text-secondary/50 font-medium">
                                                <span>Goal: {formatCurrency(PROFIT_GOALS.weekly.min)} - {formatCurrency(PROFIT_GOALS.weekly.max)}</span>
                                                <span class="{stats.weekly.netProfit >= PROFIT_GOALS.weekly.min ? 'text-green-500' : 'text-red-500'}">
                                                    {((stats.weekly.netProfit / PROFIT_GOALS.weekly.max) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    class="h-full bg-senary rounded-full transition-all duration-500" 
                                                    style="width: {calculateProgress(stats.weekly.netProfit, PROFIT_GOALS.weekly.max)}%"
                                                ></div>
                                            </div>
                                        </div>
									</div>
								</div>
							</div>
						</div>
					</Tabs.Content>

					<Tabs.Content value="monthly" class="space-y-4">
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="md:col-span-2 bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
								<div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
								<div class="flex items-center justify-between mb-6 relative">
									<div class="flex items-center gap-3">
										<div class="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
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

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
									<div class="space-y-6">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-sm font-bold text-secondary uppercase tracking-wider">Online Channel</span>
											<span class="text-base font-bold text-white">{formatCurrency(stats.monthly.revenue.online.total)}</span>
										</div>
										<div class="space-y-4">
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Down Payments</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.monthly.revenue.online.downPayment)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-500/50 rounded-full" style="width: {stats.monthly.revenue.online.total ? (stats.monthly.revenue.online.downPayment / stats.monthly.revenue.online.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Settlements</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.monthly.revenue.online.settlement)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-blue-400/50 rounded-full" style="width: {stats.monthly.revenue.online.total ? (stats.monthly.revenue.online.settlement / stats.monthly.revenue.online.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>

									<div class="space-y-6">
										<div class="flex items-center justify-between pb-2 border-b border-white/10">
											<span class="text-sm font-bold text-secondary uppercase tracking-wider">Offline Channel</span>
											<span class="text-base font-bold text-white">{formatCurrency(stats.monthly.revenue.offline.total)}</span>
										</div>
										<div class="space-y-4">
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">Cash (Tunai)</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.monthly.revenue.offline.cash)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-green-500/50 rounded-full" style="width: {stats.monthly.revenue.offline.total ? (stats.monthly.revenue.offline.cash / stats.monthly.revenue.offline.total) * 100 : 0}%"></div>
											</div>
											<div class="flex justify-between items-center">
												<span class="text-xs text-secondary/60">QRIS</span>
												<span class="text-sm font-medium text-secondary">{formatCurrency(stats.monthly.revenue.offline.qris)}</span>
											</div>
											<div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
												<div class="h-full bg-purple-500/50 rounded-full" style="width: {stats.monthly.revenue.offline.total ? (stats.monthly.revenue.offline.qris / stats.monthly.revenue.offline.total) * 100 : 0}%"></div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="grid grid-rows-2 gap-4">
								<div class="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
									<div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
									<div class="flex items-center gap-3 relative">
										<div class="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
											<TrendingDown class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-white uppercase tracking-widest">Total Expenses</h3>
									</div>
									<div class="text-right relative">
										<p class="text-2xl font-bold text-white tracking-tight">{formatCurrency(stats.monthly.expenses.total)}</p>
										<p class="text-[10px] text-secondary/60">Operational costs</p>
									</div>
								</div>

								<div class="bg-gradient-to-br from-senary/10 to-black/60 border border-senary/20 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
									<div class="flex items-center gap-3 relative">
										<div class="p-2.5 rounded-xl bg-senary/20 text-senary border border-senary/30">
											<Wallet class="h-5 w-5" />
										</div>
										<h3 class="text-sm font-bold text-senary uppercase tracking-widest">Net Profit</h3>
									</div>
									<div class="text-right relative w-full pt-4">
										<p class="text-3xl font-bold text-white tracking-tight">{formatCurrency(stats.monthly.netProfit)}</p>
										<p class="text-[10px] font-bold text-senary/80 uppercase tracking-widest mb-3">Monthly Earnings</p>

                                        <!-- Profit Range Visualization -->
                                        <div class="space-y-1">
                                            <div class="flex justify-between text-[9px] text-secondary/50 font-medium">
                                                <span>Goal: {formatCurrency(PROFIT_GOALS.monthly.min)} - {formatCurrency(PROFIT_GOALS.monthly.max)}</span>
                                                <span class="{stats.monthly.netProfit >= PROFIT_GOALS.monthly.min ? 'text-green-500' : 'text-red-500'}">
                                                    {((stats.monthly.netProfit / PROFIT_GOALS.monthly.max) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    class="h-full bg-senary rounded-full transition-all duration-500" 
                                                    style="width: {calculateProgress(stats.monthly.netProfit, PROFIT_GOALS.monthly.max)}%"
                                                ></div>
                                            </div>
                                        </div>
									</div>
								</div>
							</div>
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>

			<!-- Shared Toolbar -->
			<div class="flex flex-col xl:flex-row gap-4 justify-between items-center mb-6 pt-4 border-t border-white/5">
				<div class="flex flex-wrap gap-2 items-center w-full xl:w-auto">
					<div class="flex items-center gap-2">
						<Popover.Root>
							<Popover.Trigger asChild>
								{#snippet child({ props })}
									<Button
										variant="outline"
										class={cn(
											"h-10 justify-start text-left font-normal border-white/10 bg-white/5 text-xs w-[140px] rounded-xl hover:bg-white/10",
											!startDate && "text-muted-foreground"
										)}
										{...props}
									>
										<CalendarIcon class="mr-2 h-3.5 w-3.5" />
										{startDate ? df.format(startDate.toDate(getLocalTimeZone())) : "Start Date"}
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10 shadow-xl z-[9999]">
								<!-- Force text color with !important equivalent classes or direct styles -->
								<div class="[&_button]:!text-white [&_button:hover]:!bg-white/10 [&_button:hover]:!text-white">
									<Calendar bind:value={startDate} type="single" initialFocus class="p-3 bg-slate-950 text-white rounded-md border border-white/10"/>
								</div>
							</Popover.Content>
						</Popover.Root>

						<span class="text-secondary/30">-</span>

						<Popover.Root>
							<Popover.Trigger asChild>
								{#snippet child({ props })}
									<Button
										variant="outline"
										class={cn(
											"h-10 justify-start text-left font-normal border-white/10 bg-white/5 text-xs w-[140px] rounded-xl hover:bg-white/10",
											!endDate && "text-muted-foreground"
										)}
										{...props}
									>
										<CalendarIcon class="mr-2 h-3.5 w-3.5" />
										{endDate ? df.format(endDate.toDate(getLocalTimeZone())) : "End Date"}
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10 shadow-xl z-[9999]">
								<div class="[&_button]:!text-white [&_button:hover]:!bg-white/10 [&_button:hover]:!text-white">
									<Calendar bind:value={endDate} type="single" initialFocus class="p-3 bg-slate-950 text-white rounded-md border border-white/10"/>
								</div>
							</Popover.Content>
						</Popover.Root>
					</div>

					{#if startDate || endDate || (selectedCategories.length === 1 && selectedCategories[0] === 'All Categories') === false || selectedSource !== 'All Sources'}
						<Button variant="ghost" size="sm" onclick={clearFilters} class="h-9 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl">
							<X class="h-3.5 w-3.5 mr-1" /> Clear Filters
						</Button>
					{/if}
				</div>

				<div class="flex gap-3 w-full xl:w-auto">
					<Button onclick={openCreateIncome} size="sm" class="h-10 bg-senary text-primary hover:bg-senary/90 font-bold px-6 text-xs rounded-xl shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)] flex-1 xl:flex-none">
						<Plus class="mr-1.5 h-3.5 w-3.5" /> Record Income
					</Button>
					<Button onclick={openCreateExpense} size="sm" class="h-10 bg-white/5 text-secondary hover:bg-white/10 border border-white/10 px-6 text-xs rounded-xl flex-1 xl:flex-none">
						<Plus class="mr-1.5 h-3.5 w-3.5" /> Record Expense
					</Button>
				</div>
			</div>

			<!-- Transaction Tables Grid -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
				
				<!-- Income Table -->
				<div class="flex flex-col space-y-4 h-full">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-bold text-white">Income History</h3>
							<p class="text-xs text-secondary/60">All revenue sources (Online & Offline)</p>
						</div>
						
						<!-- Rebuilt Source Filter UI (Matches Expense) -->
						<div class="w-[160px]">
							<Popover.Root bind:open={incomeSourceOpen}>
								<Popover.Trigger asChild>
									{#snippet child({ props })}
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={incomeSourceOpen}
											class="w-full justify-between h-8 rounded-lg border-white/10 bg-white/5 text-xs text-secondary hover:bg-white/10"
											{...props}
										>
											{selectedSource}
											<Filter class="ml-2 h-3 w-3 shrink-0 opacity-50" />
										</Button>
									{/snippet}
								</Popover.Trigger>
								<Popover.Content class="w-[200px] p-0 bg-slate-950 border-white/10">
									<Command.Root>
										<Command.Input placeholder="Search source..." class="h-9" />
										<Command.Empty>No source found.</Command.Empty>
										<Command.Group>
											<Command.Item
												value="All Sources"
												onSelect={() => toggleSource('All Sources')}
											>
												<div class={cn(
													"mr-2 h-4 w-4 flex items-center justify-center rounded-sm border border-primary",
													selectedSource === 'All Sources' ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
												)}>
													<Check class="h-3 w-3" />
												</div>
												<span>All Sources</span>
											</Command.Item>
											{#each sources as source}
												<Command.Item
													value={source}
													onSelect={() => toggleSource(source)}
												>
													<div class={cn(
														"mr-2 h-4 w-4 flex items-center justify-center rounded-sm border border-primary",
														selectedSource === source ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
													)}>
														<Check class="h-3 w-3" />
													</div>
													<span>{source}</span>
												</Command.Item>
											{/each}
										</Command.Group>
									</Command.Root>
								</Popover.Content>
							</Popover.Root>
						</div>
					</div>

					<div class="rounded-3xl border border-white/5 bg-black/40 overflow-hidden backdrop-blur-md flex flex-col flex-1">
						<!-- Custom Header for Match -->
						<div class="flex justify-between items-center p-4 border-b border-white/5 bg-white/5 h-[49px]">
							<span class="text-[10px] text-secondary/50 font-bold uppercase tracking-wider w-[80px]">Date</span>
							<span class="text-[10px] text-secondary/50 font-bold uppercase tracking-wider w-[60px]">Source</span>
							<span class="text-[10px] text-secondary/50 font-bold uppercase tracking-wider flex-1 pl-2">Description</span>
							<span class="text-[10px] text-secondary/50 font-bold uppercase tracking-wider text-right w-[100px]">Amount</span>
						</div>

						<div class="flex-1">
							{#each paginatedIncome as item}
								<!-- STRICT HEIGHT, NO PADDING -> Flex Centering -->
								<div 
									class="flex items-center justify-between px-3 h-[60px] border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer last:border-0"
									onclick={() => openEditIncome(item)}
									role="button"
									tabindex="0"
									onkeydown={(e) => e.key === 'Enter' && openEditIncome(item)}
								>
									<div class="w-[80px] text-xs font-medium text-secondary">{formatDate(item.date)}</div>
									
									<div class="w-[60px]">
										<span class={cn(
											"px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider border",
											item.source === 'Online' 
												? "border-blue-500/20 bg-blue-500/10 text-blue-500" 
												: "border-green-500/20 bg-green-500/10 text-green-500"
										)}>
											{item.source}
										</span>
									</div>

									<div class="flex-1 pl-2 pr-2">
										<div class="flex flex-col justify-center">
											<span class="text-xs text-white line-clamp-1">{item.description}</span>
											<span class="text-[9px] text-secondary/50">{item.type}</span>
										</div>
									</div>
									
									<div class="w-[100px] text-right font-medium text-senary text-xs">
										{formatCurrency(item.amount)}
									</div>
								</div>
							{/each}
							{#if paginatedIncome.length === 0}
								<div class="text-center py-8 text-secondary/40 text-xs">
									No income records found
								</div>
							{/if}
						</div>

						{#if totalIncomePages > 1}
							<div class="border-t border-white/5 p-4 flex justify-end bg-white/5 h-[65px] items-center">
								<Pagination.Root count={filteredIncome.length} perPage={ITEMS_PER_PAGE} bind:page={incomePage}>
								 {#snippet children({ pages, currentPage })}
									<Pagination.Content>
										<Pagination.Item>
											<Pagination.PrevButton class="h-8 pl-2.5 flex gap-1 bg-transparent border-white/10 hover:bg-white/5 text-xs">
												<ChevronLeft class="h-4 w-4" />
												<span class="hidden sm:block">Prev</span>
											</Pagination.PrevButton>
										</Pagination.Item>
										{#each pages as page (page.key)}
											{#if page.type === "ellipsis"}
												<Pagination.Item>
													<Pagination.Ellipsis class="text-secondary/50" />
												</Pagination.Item>
											{:else}
												<Pagination.Item>
													<Pagination.Link 
														{page} 
														isActive={currentPage === page.value}
														class={cn(
															"h-8 w-8 text-xs transition-all",
															currentPage === page.value 
																? "bg-senary/20 text-senary border-senary/50 hover:bg-senary/30" 
																: "bg-transparent text-secondary hover:bg-white/5 border-transparent"
														)}
													>
														{page.value}
													</Pagination.Link>
												</Pagination.Item>
											{/if}
										{/each}
										<Pagination.Item>
											<Pagination.NextButton class="h-8 pr-2.5 flex gap-1 bg-transparent border-white/10 hover:bg-white/5 text-xs">
												<span class="hidden sm:block">Next</span>
												<ChevronRight class="h-4 w-4" />
											</Pagination.NextButton>
										</Pagination.Item>
									</Pagination.Content>
								 {/snippet}
								</Pagination.Root>
							</div>
						{/if}
					</div>
				</div>

				<!-- Expense Table -->
				<div class="flex flex-col space-y-4 h-full">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-bold text-white">Expenses</h3>
							<p class="text-xs text-secondary/60">Operational cost tracking</p>
						</div>
						<!-- Category Filter UI (Multi Select) -->
						<div class="w-[160px]">
							<Popover.Root bind:open={expenseCategoryOpen}>
								<Popover.Trigger asChild>
									{#snippet child({ props })}
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={expenseCategoryOpen}
											class="w-full justify-between h-8 rounded-lg border-white/10 bg-white/5 text-xs text-secondary hover:bg-white/10"
											{...props}
										>
											{#if selectedCategories.includes('All Categories')}
												All Categories
											{:else if selectedCategories.length === 1}
												{selectedCategories[0]}
											{:else}
												{selectedCategories.length} Selected
											{/if}
											<Filter class="ml-2 h-3 w-3 shrink-0 opacity-50" />
										</Button>
									{/snippet}
								</Popover.Trigger>
								<Popover.Content class="w-[200px] p-0 bg-slate-950 border-white/10">
									<Command.Root>
										<Command.Input placeholder="Search category..." class="h-9" />
										<Command.Empty>No category found.</Command.Empty>
										<Command.Group>
											<Command.Item
												value="All Categories"
												onSelect={() => toggleCategory('All Categories')}
											>
												<div class={cn(
													"mr-2 h-4 w-4 flex items-center justify-center rounded-sm border border-primary",
													selectedCategories.includes('All Categories') ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
												)}>
													<Check class="h-3 w-3" />
												</div>
												<span>All Categories</span>
											</Command.Item>
											{#each categories as category}
												<Command.Item
													value={category}
													onSelect={() => toggleCategory(category)}
												>
													<div class={cn(
														"mr-2 h-4 w-4 flex items-center justify-center rounded-sm border border-primary",
														selectedCategories.includes(category) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
													)}>
														<Check class="h-3 w-3" />
													</div>
													<span>{category}</span>
												</Command.Item>
											{/each}
										</Command.Group>
									</Command.Root>
								</Popover.Content>
							</Popover.Root>
						</div>
					</div>
					
					<div class="bg-black/40 rounded-3xl border border-white/5 backdrop-blur-md overflow-hidden flex flex-col flex-1">
						<div class="flex justify-between items-center p-4 border-b border-white/5 bg-white/5 h-[49px]">
							<span class="text-[10px] text-secondary/50 font-bold uppercase tracking-wider w-[120px] pl-2">Date</span>
							<span class="text-[10px] text-secondary/50 font-bold uppercase tracking-wider flex-1">Description</span>
							<span class="text-[10px] text-secondary/50 font-bold uppercase tracking-wider text-right pr-2">Amount</span>
						</div>

						<div class="flex-1">
							{#each paginatedExpenses as item}
								<!-- STRICT HEIGHT, NO PADDING -> Flex Centering -->
								<button
									class="w-full flex items-center justify-between px-3 h-[60px] rounded-0 hover:bg-white/5 transition-colors group text-left border-b border-white/5 last:border-0"
									onclick={() => openEditExpense(item)}
								>
									<div class="w-[120px] flex items-center gap-3">
										<div class="h-8 w-1 bg-red-500/50 rounded-full"></div>
										<span class="text-xs font-medium text-white">{formatDate(item.date)}</span>
									</div>
									<div class="flex-1 pr-4">
										<div class="flex flex-col justify-center">
											<span class="text-xs text-secondary/80 line-clamp-1 group-hover:text-white transition-colors">{item.description}</span>
											<span class="text-[9px] text-secondary/40">{item.category || 'General'}</span>
										</div>
									</div>
									<span class="text-xs font-bold text-red-400 group-hover:text-red-300">- {formatCurrency(item.nominal)}</span>
								</button>
							{/each}
							{#if paginatedExpenses.length === 0}
								<div class="h-32 flex items-center justify-center text-secondary/30 text-xs italic">
									No expense records found
								</div>
							{/if}
						</div>

						{#if totalExpensePages > 1}
							<div class="border-t border-white/5 p-4 flex justify-end bg-white/5 h-[65px] items-center">
								<Pagination.Root count={filteredExpenses.length} perPage={ITEMS_PER_PAGE} bind:page={expensePage}>
								 {#snippet children({ pages, currentPage })}
									<Pagination.Content>
										<Pagination.Item>
											<Pagination.PrevButton class="h-8 pl-2.5 flex gap-1 bg-transparent border-white/10 hover:bg-white/5 text-xs">
												<ChevronLeft class="h-4 w-4" />
												<span class="hidden sm:block">Prev</span>
											</Pagination.PrevButton>
										</Pagination.Item>
										{#each pages as page (page.key)}
											{#if page.type === "ellipsis"}
												<Pagination.Item>
													<Pagination.Ellipsis class="text-secondary/50" />
												</Pagination.Item>
											{:else}
												<Pagination.Item>
													<Pagination.Link 
														{page} 
														isActive={currentPage === page.value}
														class={cn(
															"h-8 w-8 text-xs transition-all",
															currentPage === page.value 
																? "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30" 
																: "bg-transparent text-secondary hover:bg-white/5 border-transparent"
														)}
													>
														{page.value}
													</Pagination.Link>
												</Pagination.Item>
											{/if}
										{/each}
										<Pagination.Item>
											<Pagination.NextButton class="h-8 pr-2.5 flex gap-1 bg-transparent border-white/10 hover:bg-white/5 text-xs">
												<span class="hidden sm:block">Next</span>
												<ChevronRight class="h-4 w-4" />
											</Pagination.NextButton>
										</Pagination.Item>
									</Pagination.Content>
								 {/snippet}
								</Pagination.Root>
							</div>
						{/if}
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
	:global(::-webkit-scrollbar) {
		width: 6px;
	}
	
	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}
	
	:global(::-webkit-scrollbar-thumb) {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
	}
	
	:global(::-webkit-scrollbar-thumb:hover) {
		background: rgba(255, 255, 255, 0.2);
	}

	/* Calendar Override */
	:global(.bg-white) {
		background-color: #020617 !important;
		color: #ffffff !important;
	}
	:global([data-radix-popper-content-wrapper]) {
		z-index: 9999 !important;
	}
</style>
