<script lang="ts">
	import { getVouchers, type Voucher } from '$lib/api/admin/voucher';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Plus, Search, Ticket, Calendar, DollarSign, Filter } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import VoucherDetailModal from './VoucherDetailModal.svelte';

	let { data } = $props();
	let vouchers = $state<Voucher[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedType = $state<string>('All');
	
	// Modal state
	let detailModalOpen = $state(false);
	let selectedVoucherId = $state<string | null>(null);

	onMount(async () => {
		await loadVouchers();
	});

	async function loadVouchers() {
		loading = true;
		const token = data.session?.access_token || '';
		const res = await getVouchers(fetch, token);
		if (res.success && res.data) {
			vouchers = res.data;
		} else {
			toast.error(res.message || 'Failed to load vouchers');
		}
		loading = false;
	}

	function openCreateModal() {
		selectedVoucherId = null;
		detailModalOpen = true;
	}

	function openEditModal(id: string) {
		selectedVoucherId = id;
		detailModalOpen = true;
	}

	let filteredVouchers = $derived(
		vouchers.filter(v => {
			const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(v.code && v.code.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchesType = selectedType === 'All' || v.type === selectedType;
			return matchesSearch && matchesType;
		})
	);

	// Stats
	const stats = $derived({
		total: vouchers.length,
		active: vouchers.filter(v => new Date(v.expireDate) > new Date()).length,
		expired: vouchers.filter(v => new Date(v.expireDate) <= new Date()).length,
		redeemCodes: vouchers.filter(v => v.type === 'redeem_code').length
	});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	const typeOptions = [
		{ value: 'All', label: 'All Types' },
		{ value: 'voucher', label: 'Voucher' },
		{ value: 'redeem_code', label: 'Redeem Code' }
	];
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
					<p class="text-3xl font-bold text-senary">{vouchers.length}</p>
					<p class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase">Total Items</p>
				</div>
			</div>

			<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
				<div>
					<h1 class="text-4xl font-bold tracking-tighter text-secondary md:text-6xl">
						Voucher <span class="text-senary">Management</span>
					</h1>
					<p class="mt-4 max-w-xl font-light text-secondary/70">
						Create and manage vouchers and redeem codes to boost customer engagement.
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="px-8">
		<div class="mx-auto max-w-7xl">
			<!-- Stats Cards -->
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
				<div class="group rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-senary/30 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold tracking-widest text-secondary/50 uppercase">Active</p>
							<p class="mt-2 text-3xl font-light text-secondary group-hover:text-senary transition-colors">{stats.active}</p>
						</div>
						<div class="rounded-full bg-green-400/10 p-3 text-green-400">
							<Ticket class="h-6 w-6" />
						</div>
					</div>
				</div>
				<div class="group rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-senary/30 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold tracking-widest text-secondary/50 uppercase">Expired</p>
							<p class="mt-2 text-3xl font-light text-secondary group-hover:text-senary transition-colors">{stats.expired}</p>
						</div>
						<div class="rounded-full bg-red-400/10 p-3 text-red-400">
							<Calendar class="h-6 w-6" />
						</div>
					</div>
				</div>
				<div class="group rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-senary/30 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold tracking-widest text-secondary/50 uppercase">Redeem Codes</p>
							<p class="mt-2 text-3xl font-light text-secondary group-hover:text-senary transition-colors">{stats.redeemCodes}</p>
						</div>
						<div class="rounded-full bg-blue-400/10 p-3 text-blue-400">
							<Ticket class="h-6 w-6" />
						</div>
					</div>
				</div>
				<div class="group rounded-3xl border border-white/5 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-senary/30 hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.1)]">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-bold tracking-widest text-secondary/50 uppercase">Total Value</p>
							<p class="mt-2 text-xl font-light text-secondary group-hover:text-senary transition-colors truncate">
								{formatCurrency(vouchers.reduce((acc, v) => acc + v.value, 0))}
							</p>
						</div>
						<div class="rounded-full bg-senary/10 p-3 text-senary">
							<DollarSign class="h-6 w-6" />
						</div>
					</div>
				</div>
			</div>

			<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<!-- Search and Filter -->
				<div class="flex flex-1 gap-4">
					<div class="relative max-w-md flex-1">
						<Search
							class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-secondary/50"
						/>
						<Input
							placeholder="Search vouchers..."
							bind:value={searchQuery}
							class="h-10 rounded-xl border-white/10 bg-white/5 pl-10 text-secondary placeholder:text-secondary/50 focus:border-senary focus:ring-senary"
						/>
					</div>

					<!-- Filter Dropdown -->
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-secondary hover:bg-white/10 hover:text-senary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-senary disabled:pointer-events-none disabled:opacity-50">
							<Filter class="mr-2 h-4 w-4" />
							{selectedType === 'All' ? 'All Types' : (selectedType === 'voucher' ? 'Voucher' : 'Redeem Code')}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="border-white/10 bg-slate-900 text-secondary">
							{#each typeOptions as option}
								<DropdownMenu.Item
									onclick={() => (selectedType = option.value)}
									class="focus:bg-white/10 focus:text-senary cursor-pointer"
								>
									{option.label}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>

				<Button 
					onclick={openCreateModal}
					class="h-10 rounded-xl bg-senary px-6 font-medium text-primary hover:bg-senary/90 shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.5)] transition-all"
				>
					<Plus class="mr-2 h-4 w-4" />
					Create New
				</Button>
			</div>

			<div class="rounded-3xl border border-white/5 bg-black/40 backdrop-blur-md overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm">
						<thead class="border-b border-white/10 bg-white/5">
							<tr>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Title</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Type</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Value</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Validity</th>
								<th class="p-6 font-bold tracking-wider text-secondary/50 uppercase text-xs">Code</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-white/5">
							{#if loading}
								{#each Array(5) as _}
									<tr>
										<td colspan="5" class="p-6">
											<div class="h-8 w-full animate-pulse rounded bg-white/5"></div>
										</td>
									</tr>
								{/each}
							{:else if filteredVouchers.length === 0}
								<tr>
									<td colspan="5" class="p-12 text-center text-secondary/50">
										No vouchers found.
									</td>
								</tr>
							{:else}
								{#each filteredVouchers as voucher}
									<tr 
										class="transition-colors hover:bg-white/5 cursor-pointer"
										onclick={() => openEditModal(voucher.voucherID)}
									>
										<td class="p-6">
											<div class="font-medium text-secondary">{voucher.title}</div>
											<div class="text-xs text-secondary/50 line-clamp-1">{voucher.description}</div>
										</td>
										<td class="p-6">
											<span class={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
												voucher.type === 'voucher' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
											}`}>
												{voucher.type.replace('_', ' ')}
											</span>
										</td>
										<td class="p-6 font-bold text-senary">{formatCurrency(voucher.value)}</td>
										<td class="p-6 text-secondary/70">
											<div class="flex flex-col text-xs">
												<span>{formatDate(voucher.startDate)}</span>
												<span class="text-secondary/30">to</span>
												<span>{formatDate(voucher.expireDate)}</span>
											</div>
										</td>
										<td class="p-6">
											{#if voucher.code}
												<span class="font-mono bg-white/10 px-2 py-1 rounded text-xs text-secondary">{voucher.code}</span>
											{:else}
												<span class="text-secondary/30">-</span>
											{/if}
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<VoucherDetailModal
		bind:open={detailModalOpen}
		voucherId={selectedVoucherId}
		token={data.session?.access_token || ''}
		onClose={() => detailModalOpen = false}
		onUpdate={loadVouchers}
	/>
</div>
