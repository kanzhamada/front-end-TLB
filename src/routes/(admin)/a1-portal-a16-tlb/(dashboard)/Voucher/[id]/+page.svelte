<script lang="ts">
	import { getVouchers, updateVoucher, type UpdateVoucherRequest, type Voucher } from '$lib/api/admin/voucher';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { ArrowLeft, Loader2, Calendar as CalendarIcon, Ticket, DollarSign, FileText } from 'lucide-svelte';
	import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	let { data } = $props();
	let loading = $state(false);
	let fetching = $state(true);
	let voucherId = $page.params.id;

	let formData = $state<UpdateVoucherRequest>({
		type: 'voucher',
		title: '',
		value: 0,
		startDate: '',
		expireDate: '',
		description: '',
		code: ''
	});

	// Date handling
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let startDateValue = $state<DateValue | undefined>(undefined);
	let expireDateValue = $state<DateValue | undefined>(undefined);

	$effect(() => {
		if (startDateValue) {
			formData.startDate = startDateValue.toString();
		}
		if (expireDateValue) {
			formData.expireDate = expireDateValue.toString();
		}
	});

	onMount(async () => {
		await loadVoucher();
	});

	async function loadVoucher() {
		fetching = true;
		const token = data.session?.access_token || '';
		// Since there is no get-by-id, we fetch all and filter
		const res = await getVouchers(fetch, token);
		
		if (res.success && res.data) {
			const voucher = res.data.find(v => v.voucherID === voucherId);
			if (voucher) {
				formData = {
					type: voucher.type,
					title: voucher.title,
					value: voucher.value,
					startDate: voucher.startDate,
					expireDate: voucher.expireDate,
					description: voucher.description,
					code: voucher.code || ''
				};
				
				// Parse dates
				try {
					// Assuming date format YYYY-MM-DD from API
					if (voucher.startDate) startDateValue = parseDate(voucher.startDate.split('T')[0]);
					if (voucher.expireDate) expireDateValue = parseDate(voucher.expireDate.split('T')[0]);
				} catch (e) {
					console.error('Date parsing error', e);
				}
			} else {
				toast.error('Voucher not found');
				goto('/a1-portal-a16-tlb/Voucher');
			}
		} else {
			toast.error(res.message || 'Failed to load voucher');
			goto('/a1-portal-a16-tlb/Voucher');
		}
		fetching = false;
	}

	async function handleSubmit() {
		if (!formData.title || !formData.value || !formData.startDate || !formData.expireDate) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (formData.type === 'redeem_code' && !formData.code) {
			toast.error('Please enter a redeem code');
			return;
		}

		loading = true;
		const token = data.session?.access_token || '';
		const res = await updateVoucher(fetch, voucherId, formData, token);
		
		if (res.success) {
			toast.success('Voucher updated successfully');
			goto('/a1-portal-a16-tlb/Voucher');
		} else {
			toast.error(res.message || 'Failed to update voucher');
		}
		loading = false;
	}
</script>

<div class="min-h-screen w-full bg-slate-950 text-secondary selection:bg-senary/30 p-8">
	<div class="mx-auto max-w-3xl">
		<!-- Header -->
		<div class="mb-8 flex items-center gap-4">
			<Button
				variant="ghost"
				size="icon"
				onclick={() => goto('/a1-portal-a16-tlb/Voucher')}
				class="rounded-full border border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-senary hover:border-senary/50 transition-all"
			>
				<ArrowLeft class="h-5 w-5" />
			</Button>
			<div>
				<h1 class="text-3xl font-bold text-secondary">Edit Voucher</h1>
				<p class="text-secondary/60">Update existing voucher details.</p>
			</div>
		</div>

		{#if fetching}
			<div class="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md">
				<div class="flex flex-col items-center gap-4">
					<Loader2 class="h-8 w-8 animate-spin text-senary" />
					<p class="text-sm font-medium tracking-widest uppercase text-secondary/50">Loading Details...</p>
				</div>
			</div>
		{:else}
			<div class="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-8 shadow-2xl">
				<div class="grid gap-8">
					<!-- Type Selection -->
					<div class="space-y-4">
						<Label class="text-sm font-bold uppercase tracking-widest text-secondary/50">Voucher Type</Label>
						<div class="grid grid-cols-2 gap-4">
							<button
								class={cn(
									"flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition-all",
									formData.type === 'voucher' 
										? "bg-senary/10 border-senary text-senary shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)]" 
										: "bg-white/5 border-white/10 text-secondary/50 hover:bg-white/10 hover:border-white/20"
								)}
								onclick={() => formData.type = 'voucher'}
							>
								<Ticket class="h-8 w-8" />
								<span class="font-bold">Standard Voucher</span>
							</button>
							<button
								class={cn(
									"flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition-all",
									formData.type === 'redeem_code' 
										? "bg-senary/10 border-senary text-senary shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)]" 
										: "bg-white/5 border-white/10 text-secondary/50 hover:bg-white/10 hover:border-white/20"
								)}
								onclick={() => formData.type = 'redeem_code'}
							>
								<FileText class="h-8 w-8" />
								<span class="font-bold">Redeem Code</span>
							</button>
						</div>
					</div>

					<div class="grid gap-6 md:grid-cols-2">
						<!-- Title -->
						<div class="space-y-2 md:col-span-2">
							<Label class="text-secondary">Title</Label>
							<Input 
								bind:value={formData.title} 
								placeholder="e.g. New Year Promo"
								class="h-12 rounded-xl bg-black/20 border-white/10 text-secondary placeholder:text-secondary/30 focus:border-senary focus:ring-senary/20"
							/>
						</div>

						<!-- Code (Conditional) -->
						{#if formData.type === 'redeem_code'}
							<div class="space-y-2 md:col-span-2">
								<Label class="text-secondary">Redeem Code</Label>
								<div class="relative">
									<Ticket class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/50" />
									<Input 
										bind:value={formData.code} 
										placeholder="e.g. PROMO2025"
										class="h-12 pl-11 rounded-xl bg-black/20 border-white/10 text-secondary placeholder:text-secondary/30 focus:border-senary focus:ring-senary/20 font-mono uppercase tracking-wider"
									/>
								</div>
							</div>
						{/if}

						<!-- Value -->
						<div class="space-y-2 md:col-span-2">
							<Label class="text-secondary">Value (IDR)</Label>
							<div class="relative">
								<DollarSign class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/50" />
								<Input 
									type="number"
									bind:value={formData.value} 
									placeholder="e.g. 50000"
									class="h-12 pl-11 rounded-xl bg-black/20 border-white/10 text-secondary placeholder:text-secondary/30 focus:border-senary focus:ring-senary/20"
								/>
							</div>
						</div>

						<!-- Dates -->
						<div class="space-y-2">
							<Label class="text-secondary">Start Date</Label>
							<Popover.Root>
								<Popover.Trigger asChild let:builder>
									<Button
										variant="outline"
										class={cn(
											"h-12 w-full justify-start text-left font-normal rounded-xl bg-black/20 border-white/10 text-secondary hover:bg-white/5 hover:text-senary hover:border-senary/50",
											!startDateValue && "text-muted-foreground"
										)}
										builders={[builder]}
									>
										<CalendarIcon class="mr-2 h-4 w-4" />
										{startDateValue ? df.format(startDateValue.toDate(getLocalTimeZone())) : "Pick a date"}
									</Button>
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10">
									<Calendar bind:value={startDateValue} initialFocus class="text-secondary" />
								</Popover.Content>
							</Popover.Root>
						</div>

						<div class="space-y-2">
							<Label class="text-secondary">Expire Date</Label>
							<Popover.Root>
								<Popover.Trigger asChild let:builder>
									<Button
										variant="outline"
										class={cn(
											"h-12 w-full justify-start text-left font-normal rounded-xl bg-black/20 border-white/10 text-secondary hover:bg-white/5 hover:text-senary hover:border-senary/50",
											!expireDateValue && "text-muted-foreground"
										)}
										builders={[builder]}
									>
										<CalendarIcon class="mr-2 h-4 w-4" />
										{expireDateValue ? df.format(expireDateValue.toDate(getLocalTimeZone())) : "Pick a date"}
									</Button>
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10">
									<Calendar bind:value={expireDateValue} initialFocus class="text-secondary" />
								</Popover.Content>
							</Popover.Root>
						</div>

						<!-- Description -->
						<div class="space-y-2 md:col-span-2">
							<Label class="text-secondary">Description</Label>
							<Textarea 
								bind:value={formData.description} 
								placeholder="Enter voucher description..."
								class="min-h-[120px] rounded-xl bg-black/20 border-white/10 text-secondary placeholder:text-secondary/30 focus:border-senary focus:ring-senary/20 resize-none"
							/>
						</div>
					</div>

					<!-- Submit -->
					<Button 
						onclick={handleSubmit}
						disabled={loading}
						class="w-full h-12 rounded-xl bg-senary text-primary hover:bg-senary/90 font-bold text-lg shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
					>
						{#if loading}
							<Loader2 class="mr-2 h-5 w-5 animate-spin" />
							Updating...
						{:else}
							Update Voucher
						{/if}
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
