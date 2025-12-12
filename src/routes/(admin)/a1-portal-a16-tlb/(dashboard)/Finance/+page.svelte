<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import {
		DollarSign,
		TrendingUp,
		TrendingDown,
		Calendar as CalendarIcon,
		Search,
		Plus,
		Filter,
		Download,
		MoreHorizontal,
		Wallet,
		PieChart
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';
	import IncomeModal from './IncomeModal.svelte';
	import ExpenseModal from './ExpenseModal.svelte';
	import {
		getCashFlowStats,
		getOfflineIncome,
		deleteOfflineIncome,
		getExpenses,
		deleteExpense,
		type OfflineIncome,
		type Expense,
		type CashFlowStats
	} from '$lib/api/admin/finance';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { DateFormatter } from '@internationalized/date';

	let { data } = $props();
	let token = $derived(data.session?.access_token || '');

	$effect(() => {
		console.log('Finance Page Token:', token);
	});

	let stats: CashFlowStats = $state({
		daily: { offline_income: 0, online_income: 0, expenses: 0, cash_flow: 0 },
		monthly: { offline_income: 0, online_income: 0, expenses: 0, cash_flow: 0 }
	});

	let incomeRecords: OfflineIncome[] = $state([]);
	let expenseRecords: Expense[] = $state([]);
	let isLoading = $state(true);
	let searchQuery = $state('');

	let incomeModalOpen = $state(false);
	let selectedIncome: OfflineIncome | null = $state(null);

	let expenseModalOpen = $state(false);
	let selectedExpense: Expense | null = $state(null);

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
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
		try {
			const [statsData, incomeData, expenseData] = await Promise.all([
				getCashFlowStats(fetch, token),
				getOfflineIncome(fetch, token),
				getExpenses(fetch, token)
			]);

			if (statsData?.data) stats = statsData.data;
			if (incomeData?.data) incomeRecords = incomeData.data;
			if (expenseData?.data) expenseRecords = expenseData.data;
		} catch (error) {
			console.error('Error loading finance data:', error);
			toast.error('Failed to load finance data');
		} finally {
			isLoading = false;
		}
	}

	function openCreateIncome() {
		selectedIncome = null;
		incomeModalOpen = true;
	}

	function openEditIncome(income: OfflineIncome) {
		selectedIncome = income;
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

	let filteredIncome = $derived(
		incomeRecords.filter(
			(item) =>
				item.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.type.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	let filteredExpenses = $derived(
		expenseRecords.filter((item) =>
			item.description.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	$effect(() => {
		if (token) {
			loadData();
		}
	});
</script>

<div class="h-[calc(100vh-6rem)] flex flex-col gap-4 p-6 max-w-[1920px] mx-auto overflow-hidden">
	<!-- Header Section -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
		<div class="flex items-center gap-3">
			<div class="p-2.5 bg-senary/10 rounded-xl border border-senary/20">
				<PieChart class="h-5 w-5 text-senary" />
			</div>
			<div>
				<h1 class="text-xl font-bold text-white tracking-tight">Financial Overview</h1>
				<p class="text-xs text-secondary/60">Real-time financial dashboard</p>
			</div>
		</div>
		<div class="flex items-center gap-3">
			<div class="relative group">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search
						class="h-3.5 w-3.5 text-secondary/40 group-focus-within:text-senary transition-colors"
					/>
				</div>
				<Input
					type="text"
					placeholder="Search transactions..."
					class="pl-9 bg-white/5 border-white/10 focus:border-senary/50 w-64 h-9 text-sm transition-all rounded-lg"
					bind:value={searchQuery}
				/>
			</div>
			<Button
				variant="outline"
				size="sm"
				class="border-white/10 hover:bg-white/5 hover:text-white h-9 rounded-lg"
			>
				<Filter class="mr-2 h-3.5 w-3.5" />
				Filter
			</Button>
			<Button
				variant="outline"
				size="sm"
				class="border-white/10 hover:bg-white/5 hover:text-white h-9 rounded-lg"
			>
				<Download class="mr-2 h-3.5 w-3.5" />
				Export
			</Button>
		</div>
	</div>

	<!-- Stats Section (Compact) -->
	<div class="grid grid-cols-1 2xl:grid-cols-2 gap-4 shrink-0">
		<!-- Daily Group -->
		<div class="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
			<div class="flex items-center gap-2 mb-3 px-1">
				<div class="h-3 w-1 bg-senary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
				<h3 class="text-[10px] font-bold text-white uppercase tracking-widest">Daily</h3>
			</div>
			<div class="grid grid-cols-3 gap-3">
				<div
					class="bg-black/20 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
				>
					<p class="text-[10px] font-medium text-secondary/60 uppercase tracking-wider mb-1">
						Income
					</p>
					<div class="text-lg font-bold text-white tracking-tight">
						{formatCurrency(stats.daily.offline_income + stats.daily.online_income)}
					</div>
					<div class="mt-1 flex items-center text-[10px] text-green-400">
						<ArrowUpRight class="mr-1 h-3 w-3" />
						<span class="opacity-80">Revenue</span>
					</div>
				</div>
				<div
					class="bg-black/20 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
				>
					<p class="text-[10px] font-medium text-secondary/60 uppercase tracking-wider mb-1">
						Expenses
					</p>
					<div class="text-lg font-bold text-white tracking-tight">
						{formatCurrency(stats.daily.expenses)}
					</div>
					<div class="mt-1 flex items-center text-[10px] text-red-400">
						<ArrowDownRight class="mr-1 h-3 w-3" />
						<span class="opacity-80">Costs</span>
					</div>
				</div>
				<div
					class="bg-gradient-to-br from-senary/10 to-black/40 rounded-lg p-3 border border-senary/20 hover:border-senary/30 transition-colors"
				>
					<p class="text-[10px] font-bold text-senary uppercase tracking-wider mb-1">Net</p>
					<div class="text-lg font-bold text-white tracking-tight">
						{formatCurrency(stats.daily.cash_flow)}
					</div>
					<div class="mt-1 flex items-center text-[10px] text-senary">
						<Wallet class="mr-1 h-3 w-3" />
						<span class="opacity-80">Profit</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Monthly Group -->
		<div class="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
			<div class="flex items-center gap-2 mb-3 px-1">
				<div class="h-3 w-1 bg-senary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
				<h3 class="text-[10px] font-bold text-white uppercase tracking-widest">Monthly</h3>
			</div>
			<div class="grid grid-cols-3 gap-3">
				<div
					class="bg-black/20 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
				>
					<p class="text-[10px] font-medium text-secondary/60 uppercase tracking-wider mb-1">
						Income
					</p>
					<div class="text-lg font-bold text-white tracking-tight">
						{formatCurrency(stats.monthly.offline_income + stats.monthly.online_income)}
					</div>
					<div class="mt-1 flex items-center text-[10px] text-green-400">
						<ArrowUpRight class="mr-1 h-3 w-3" />
						<span class="opacity-80">Revenue</span>
					</div>
				</div>
				<div
					class="bg-black/20 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
				>
					<p class="text-[10px] font-medium text-secondary/60 uppercase tracking-wider mb-1">
						Expenses
					</p>
					<div class="text-lg font-bold text-white tracking-tight">
						{formatCurrency(stats.monthly.expenses)}
					</div>
					<div class="mt-1 flex items-center text-[10px] text-red-400">
						<ArrowDownRight class="mr-1 h-3 w-3" />
						<span class="opacity-80">Costs</span>
					</div>
				</div>
				<div
					class="bg-gradient-to-br from-senary/10 to-black/40 rounded-lg p-3 border border-senary/20 hover:border-senary/30 transition-colors"
				>
					<p class="text-[10px] font-bold text-senary uppercase tracking-wider mb-1">Net</p>
					<div class="text-lg font-bold text-white tracking-tight">
						{formatCurrency(stats.monthly.cash_flow)}
					</div>
					<div class="mt-1 flex items-center text-[10px] text-senary">
						<Wallet class="mr-1 h-3 w-3" />
						<span class="opacity-80">Profit</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Transactions Section (Full Height) -->
	<div class="grid grid-cols-1 2xl:grid-cols-2 gap-4 flex-1 min-h-0">
		<!-- Income Column -->
		<div
			class="flex flex-col bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden"
		>
			<div class="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
				<div class="flex items-center gap-3">
					<div class="h-8 w-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
					<div>
						<h3 class="text-sm font-bold text-white tracking-tight">Income Records</h3>
						<p class="text-[10px] text-secondary/60">Offline transactions</p>
					</div>
				</div>
				<Button
					onclick={openCreateIncome}
					size="sm"
					class="bg-senary text-primary hover:bg-senary/90 font-bold shadow-sm h-8 text-xs px-4 rounded-lg"
				>
					<Plus class="mr-1.5 h-3.5 w-3.5" />
					Add
				</Button>
			</div>

			<div class="flex-1 overflow-hidden relative">
				<div class="absolute inset-0 overflow-y-auto no-scrollbar">
					<Table.Root>
						<Table.Header
							class="bg-black/20 sticky top-0 z-10 backdrop-blur-md border-b border-white/5"
						>
							<Table.Row class="border-white/5 hover:bg-transparent">
								<Table.Head
									class="text-senary font-bold uppercase tracking-wider text-[10px] py-3 pl-4 h-auto"
									>Date</Table.Head
								>
								<Table.Head
									class="text-senary font-bold uppercase tracking-wider text-[10px] py-3 h-auto"
									>Service</Table.Head
								>
								<Table.Head
									class="text-senary font-bold uppercase tracking-wider text-[10px] py-3 h-auto"
									>Type</Table.Head
								>
								<Table.Head
									class="text-senary font-bold uppercase tracking-wider text-[10px] py-3 text-right h-auto"
									>Amount</Table.Head
								>
								<Table.Head class="w-[40px] py-3 h-auto"></Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredIncome as item}
								<Table.Row
									class="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
									onclick={() => openEditIncome(item)}
								>
									<Table.Cell class="font-medium text-secondary py-2.5 pl-4">
										<div class="flex items-center gap-2">
											<span class="text-xs">{formatDate(item.date)}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="text-secondary/80 text-xs py-2.5"
										>{item.service.name}</Table.Cell
									>
									<Table.Cell class="py-2.5">
										<span
											class={cn(
												'px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider',
												item.type === 'Tunai'
													? 'bg-green-500/10 text-green-500 border-green-500/20'
													: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
											)}
										>
											{item.type}
										</span>
									</Table.Cell>
									<Table.Cell class="text-right font-bold text-senary text-xs py-2.5">
										{formatCurrency(item.price)}
									</Table.Cell>
									<Table.Cell class="py-2.5">
										<Button
											variant="ghost"
											size="icon"
											class="h-6 w-6 text-secondary/50 hover:text-white hover:bg-white/10 rounded-full"
										>
											<MoreHorizontal class="h-3.5 w-3.5" />
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
							{#if filteredIncome.length === 0}
								<Table.Row>
									<Table.Cell colspan={5} class="h-32 text-center text-secondary/50">
										<div class="flex flex-col items-center justify-center gap-2">
											<Search class="h-5 w-5 text-secondary/30" />
											<p class="text-xs">No records found</p>
										</div>
									</Table.Cell>
								</Table.Row>
							{/if}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		</div>

		<!-- Expense Column -->
		<div
			class="flex flex-col bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden"
		>
			<div class="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
				<div class="flex items-center gap-3">
					<div class="h-8 w-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
					<div>
						<h3 class="text-sm font-bold text-white tracking-tight">Expense Records</h3>
						<p class="text-[10px] text-secondary/60">Operational costs</p>
					</div>
				</div>
				<Button
					onclick={openCreateExpense}
					size="sm"
					class="bg-senary text-primary hover:bg-senary/90 font-bold shadow-sm h-8 text-xs px-4 rounded-lg"
				>
					<Plus class="mr-1.5 h-3.5 w-3.5" />
					Add
				</Button>
			</div>

			<div class="flex-1 overflow-hidden relative">
				<div class="absolute inset-0 overflow-y-auto no-scrollbar">
					<Table.Root>
						<Table.Header
							class="bg-black/20 sticky top-0 z-10 backdrop-blur-md border-b border-white/5"
						>
							<Table.Row class="border-white/5 hover:bg-transparent">
								<Table.Head
									class="text-senary font-bold uppercase tracking-wider text-[10px] py-3 pl-4 h-auto"
									>Date</Table.Head
								>
								<Table.Head
									class="text-senary font-bold uppercase tracking-wider text-[10px] py-3 h-auto"
									>Description</Table.Head
								>
								<Table.Head
									class="text-senary font-bold uppercase tracking-wider text-[10px] py-3 text-right h-auto"
									>Amount</Table.Head
								>
								<Table.Head class="w-[40px] py-3 h-auto"></Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredExpenses as item}
								<Table.Row
									class="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
									onclick={() => openEditExpense(item)}
								>
									<Table.Cell class="font-medium text-secondary py-2.5 pl-4">
										<div class="flex items-center gap-2">
											<span class="text-xs">{formatDate(item.date)}</span>
										</div>
									</Table.Cell>
									<Table.Cell class="text-secondary/80 text-xs py-2.5"
										>{item.description}</Table.Cell
									>
									<Table.Cell class="text-right font-bold text-red-400 text-xs py-2.5">
										- {formatCurrency(item.nominal)}
									</Table.Cell>
									<Table.Cell class="py-2.5">
										<Button
											variant="ghost"
											size="icon"
											class="h-6 w-6 text-secondary/50 hover:text-white hover:bg-white/10 rounded-full"
										>
											<MoreHorizontal class="h-3.5 w-3.5" />
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
							{#if filteredExpenses.length === 0}
								<Table.Row>
									<Table.Cell colspan={4} class="h-32 text-center text-secondary/50">
										<div class="flex flex-col items-center justify-center gap-2">
											<Search class="h-5 w-5 text-secondary/30" />
											<p class="text-xs">No records found</p>
										</div>
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
	initialData={selectedIncome}
	onUpdate={handleIncomeSuccess}
	{token}
/>

<ExpenseModal
	bind:open={expenseModalOpen}
	initialData={selectedExpense}
	onUpdate={handleExpenseSuccess}
	{token}
/>

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
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
