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
		ArrowUpRight,
		ArrowDownRight,
		Wallet,
		PieChart
	} from 'lucide-svelte';
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import * as Table from "$lib/components/ui/table";
	import * as Tabs from "$lib/components/ui/tabs";
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
	import { toast } from "svelte-sonner";
	import { cn } from "$lib/utils";
	import { DateFormatter } from "@internationalized/date";

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
			toast.error("Failed to load finance data");
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

	async function handleIncomeSuccess() {
		await loadData();
		incomeModalOpen = false;
	}

	async function handleExpenseSuccess() {
		await loadData();
		expenseModalOpen = false;
	}

	let filteredIncome = $derived(incomeRecords.filter(item => 
		item.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.type.toLowerCase().includes(searchQuery.toLowerCase())
	));

	let filteredExpenses = $derived(expenseRecords.filter(item => 
		item.description.toLowerCase().includes(searchQuery.toLowerCase())
	));

	$effect(() => {
		if (token) {
			loadData();
		}
	});
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
					<p class="text-3xl font-bold text-senary">{formatCurrency(stats.daily.cash_flow)}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Daily Net Flow</p>
				</div>
			</div>

			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Finance <span class="text-senary">Management</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Real-time financial dashboard. Monitor cash flow, track income and expenses, and analyze financial performance.
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8 pb-20">
		<div class="mx-auto max-w-[1600px] space-y-6">
			<!-- Controls -->
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-1 gap-4">
					<div class="relative max-w-md flex-1">
						<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-secondary/50" />
						<Input
							placeholder="Search transactions..."
							bind:value={searchQuery}
							class="h-10 rounded-xl border-white/10 bg-white/5 pl-10 text-secondary placeholder:text-secondary/50 focus:border-senary focus:ring-senary"
						/>
					</div>
					<Button variant="outline" class="h-10 rounded-xl border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary">
						<Filter class="mr-2 h-4 w-4" />
						Filter
					</Button>
					<Button variant="outline" class="h-10 rounded-xl border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary">
						<Download class="mr-2 h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<!-- Stats Section -->
			<div class="grid grid-cols-1 2xl:grid-cols-2 gap-4">
				<!-- Daily Group -->
				<div class="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]">
					<div class="flex items-center gap-3 mb-6">
						<div class="h-3 w-1 bg-senary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
						<h3 class="text-xs font-bold text-white uppercase tracking-widest">Daily Performance</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
							<p class="text-[10px] font-medium text-secondary/60 uppercase tracking-wider mb-2">Income</p>
							<div class="text-xl font-bold text-white tracking-tight">
								{formatCurrency(stats.daily.offline_income + stats.daily.online_income)}
							</div>
							<div class="mt-2 flex items-center text-[10px] text-green-400">
								<ArrowUpRight class="mr-1 h-3 w-3" />
								<span class="opacity-80">Revenue</span>
							</div>
						</div>
						<div class="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
							<p class="text-[10px] font-medium text-secondary/60 uppercase tracking-wider mb-2">Expenses</p>
							<div class="text-xl font-bold text-white tracking-tight">
								{formatCurrency(stats.daily.expenses)}
							</div>
							<div class="mt-2 flex items-center text-[10px] text-red-400">
								<ArrowDownRight class="mr-1 h-3 w-3" />
								<span class="opacity-80">Costs</span>
							</div>
						</div>
						<div class="bg-gradient-to-br from-senary/10 to-black/40 rounded-xl p-4 border border-senary/20 hover:border-senary/30 transition-colors">
							<p class="text-[10px] font-bold text-senary uppercase tracking-wider mb-2">Net Flow</p>
							<div class="text-xl font-bold text-white tracking-tight">
								{formatCurrency(stats.daily.cash_flow)}
							</div>
							<div class="mt-2 flex items-center text-[10px] text-senary">
								<Wallet class="mr-1 h-3 w-3" />
								<span class="opacity-80">Profit</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Monthly Group -->
				<div class="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]">
					<div class="flex items-center gap-3 mb-6">
						<div class="h-3 w-1 bg-senary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
						<h3 class="text-xs font-bold text-white uppercase tracking-widest">Monthly Performance</h3>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div class="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
							<p class="text-[10px] font-medium text-secondary/60 uppercase tracking-wider mb-2">Income</p>
							<div class="text-xl font-bold text-white tracking-tight">
								{formatCurrency(stats.monthly.offline_income + stats.monthly.online_income)}
							</div>
							<div class="mt-2 flex items-center text-[10px] text-green-400">
								<ArrowUpRight class="mr-1 h-3 w-3" />
								<span class="opacity-80">Revenue</span>
							</div>
						</div>
						<div class="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
							<p class="text-[10px] font-medium text-secondary/60 uppercase tracking-wider mb-2">Expenses</p>
							<div class="text-xl font-bold text-white tracking-tight">
								{formatCurrency(stats.monthly.expenses)}
							</div>
							<div class="mt-2 flex items-center text-[10px] text-red-400">
								<ArrowDownRight class="mr-1 h-3 w-3" />
								<span class="opacity-80">Costs</span>
							</div>
						</div>
						<div class="bg-gradient-to-br from-senary/10 to-black/40 rounded-xl p-4 border border-senary/20 hover:border-senary/30 transition-colors">
							<p class="text-[10px] font-bold text-senary uppercase tracking-wider mb-2">Net Flow</p>
							<div class="text-xl font-bold text-white tracking-tight">
								{formatCurrency(stats.monthly.cash_flow)}
							</div>
							<div class="mt-2 flex items-center text-[10px] text-senary">
								<Wallet class="mr-1 h-3 w-3" />
								<span class="opacity-80">Profit</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Transactions Section -->
			<div class="grid grid-cols-1 2xl:grid-cols-2 gap-6">
				<!-- Income Column -->
				<div class="flex flex-col bg-black/40 rounded-3xl border border-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
					<div class="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
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
							class="bg-senary/10 text-senary hover:bg-senary hover:text-primary transition-all font-bold shadow-sm h-9 text-xs px-4 rounded-xl border border-senary/20"
						>
							<Plus class="mr-1.5 h-3.5 w-3.5" />
							Add New
						</Button>
					</div>

					<div class="overflow-x-auto">
						<Table.Root>
							<Table.Header class="bg-white/5 border-b border-white/5">
								<Table.Row class="border-white/5 hover:bg-transparent">
									<Table.Head class="text-senary font-bold uppercase tracking-wider text-[10px] py-4 pl-6">Date</Table.Head>
									<Table.Head class="text-senary font-bold uppercase tracking-wider text-[10px] py-4">Service</Table.Head>
									<Table.Head class="text-senary font-bold uppercase tracking-wider text-[10px] py-4">Type</Table.Head>
									<Table.Head class="text-senary font-bold uppercase tracking-wider text-[10px] py-4 text-right">Amount</Table.Head>
									<Table.Head class="w-[40px] py-4 pr-6"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each filteredIncome as item}
									<Table.Row 
										class="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
										onclick={() => openEditIncome(item)}
									>
										<Table.Cell class="font-medium text-secondary py-4 pl-6">
											<span class="text-xs bg-white/5 px-2 py-1 rounded-md">{formatDate(item.date)}</span>
										</Table.Cell>
										<Table.Cell class="text-secondary/80 text-xs py-4">{item.service.name}</Table.Cell>
										<Table.Cell class="py-4">
											<span class={cn(
												"px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider",
												item.type === 'Tunai' 
													? "bg-green-500/10 text-green-500 border-green-500/20" 
													: "bg-blue-500/10 text-blue-500 border-blue-500/20"
											)}>
												{item.type}
											</span>
										</Table.Cell>
										<Table.Cell class="text-right font-bold text-senary text-xs py-4">
											{formatCurrency(item.price)}
										</Table.Cell>
										<Table.Cell class="py-4 pr-6 text-right">
											<Button variant="ghost" size="icon" class="h-8 w-8 text-secondary/50 hover:text-white hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
												<MoreHorizontal class="h-4 w-4" />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
								{#if filteredIncome.length === 0}
									<Table.Row>
										<Table.Cell colspan={5} class="h-48 text-center text-secondary/50">
											<div class="flex flex-col items-center justify-center gap-2">
												<div class="p-4 rounded-full bg-white/5">
													<Search class="h-6 w-6 text-secondary/30" />
												</div>
												<p class="text-sm font-medium">No income records found</p>
											</div>
										</Table.Cell>
									</Table.Row>
								{/if}
							</Table.Body>
						</Table.Root>
					</div>
				</div>

				<!-- Expense Column -->
				<div class="flex flex-col bg-black/40 rounded-3xl border border-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
					<div class="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
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
							class="bg-senary/10 text-senary hover:bg-senary hover:text-primary transition-all font-bold shadow-sm h-9 text-xs px-4 rounded-xl border border-senary/20"
						>
							<Plus class="mr-1.5 h-3.5 w-3.5" />
							Add New
						</Button>
					</div>

					<div class="overflow-x-auto">
						<Table.Root>
							<Table.Header class="bg-white/5 border-b border-white/5">
								<Table.Row class="border-white/5 hover:bg-transparent">
									<Table.Head class="text-senary font-bold uppercase tracking-wider text-[10px] py-4 pl-6">Date</Table.Head>
									<Table.Head class="text-senary font-bold uppercase tracking-wider text-[10px] py-4">Description</Table.Head>
									<Table.Head class="text-senary font-bold uppercase tracking-wider text-[10px] py-4 text-right">Amount</Table.Head>
									<Table.Head class="w-[40px] py-4 pr-6"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each filteredExpenses as item}
									<Table.Row 
										class="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
										onclick={() => openEditExpense(item)}
									>
										<Table.Cell class="font-medium text-secondary py-4 pl-6">
											<span class="text-xs bg-white/5 px-2 py-1 rounded-md">{formatDate(item.date)}</span>
										</Table.Cell>
										<Table.Cell class="text-secondary/80 text-xs py-4">{item.description}</Table.Cell>
										<Table.Cell class="text-right font-bold text-red-400 text-xs py-4">
											- {formatCurrency(item.nominal)}
										</Table.Cell>
										<Table.Cell class="py-4 pr-6 text-right">
											<Button variant="ghost" size="icon" class="h-8 w-8 text-secondary/50 hover:text-white hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
												<MoreHorizontal class="h-4 w-4" />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
								{#if filteredExpenses.length === 0}
									<Table.Row>
										<Table.Cell colspan={4} class="h-48 text-center text-secondary/50">
											<div class="flex flex-col items-center justify-center gap-2">
												<div class="p-4 rounded-full bg-white/5">
													<Search class="h-6 w-6 text-secondary/30" />
												</div>
												<p class="text-sm font-medium">No expense records found</p>
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
</div>

<!-- Modals -->
<IncomeModal 
	bind:open={incomeModalOpen} 
	initialData={selectedIncome}
	onUpdate={handleIncomeSuccess}
	token={token}
/>

<ExpenseModal 
	bind:open={expenseModalOpen} 
	initialData={selectedExpense}
	onUpdate={handleExpenseSuccess}
	token={token}
/>

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.no-scrollbar {
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
	}
</style>
