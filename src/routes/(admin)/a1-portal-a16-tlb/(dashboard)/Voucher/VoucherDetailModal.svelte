<script lang="ts">
	import { createVoucher, updateVoucher, deleteVoucher, getVoucherById, type CreateVoucherRequest } from '$lib/api/admin/voucher';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Loader2, Calendar as CalendarIcon, Ticket, DollarSign, FileText, Trash2, X } from 'lucide-svelte';
	import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import AdminConfirmDialog from '$lib/components/ui/AdminConfirmDialog.svelte';

	let { voucherId = null, token, open = $bindable(false), onClose, onUpdate } = $props<{
		voucherId?: string | null;
		token: string;
		open: boolean;
		onClose: () => void;
		onUpdate: () => void;
	}>();

	let loading = $state(false);
	let fetching = $state(false);

	let formData = $state<CreateVoucherRequest>({
		type: 'voucher',
		title: '',
		value: 0,
		startDate: '',
		expireDate: '',
		description: '',
		price: 0,
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

	$effect(() => {
		if (open) {
			if (voucherId) {
				loadVoucher();
			} else {
				resetForm();
			}
		}
	});

	function resetForm() {
		formData = {
			type: 'voucher',
			title: '',
			value: 0,
			startDate: '',
			expireDate: '',
			description: '',
			price: 0,
			code: ''
		};
		startDateValue = undefined;
		expireDateValue = undefined;
	}

	async function loadVoucher() {
		if (!voucherId) return;
		fetching = true;
		const res = await getVoucherById(fetch, voucherId, token);
		
		if (res.success && res.data) {
			const voucher = res.data;
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
				if (voucher.startDate) startDateValue = parseDate(voucher.startDate.split('T')[0]);
				if (voucher.expireDate) expireDateValue = parseDate(voucher.expireDate.split('T')[0]);
			} catch (e) {
				console.error('Date parsing error', e);
			}
		} else {
			toast.error(res.message || 'Failed to load voucher details');
			onClose();
		}
		fetching = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!formData.title || !formData.value || !formData.startDate || !formData.expireDate) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (formData.type === 'redeem_code' && !formData.code) {
			toast.error('Please enter a redeem code');
			return;
		}

		loading = true;
		let res;
		if (voucherId) {
			res = await updateVoucher(fetch, voucherId, formData, token);
		} else {
			res = await createVoucher(fetch, formData, token);
		}
		
		if (res.success) {
			toast.success(`Voucher ${voucherId ? 'updated' : 'created'} successfully`);
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || `Failed to ${voucherId ? 'update' : 'create'} voucher`);
		}
		loading = false;
	}

	// Delete Confirmation State
	let confirmOpen = $state(false);
	let deleteLoading = $state(false);

	function initiateDelete() {
		confirmOpen = true;
	}

	async function confirmDelete() {
		if (!voucherId) return;
		
		deleteLoading = true;
		const res = await deleteVoucher(fetch, voucherId, token);
		
		if (res.success) {
			toast.success('Voucher deleted successfully');
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || 'Failed to delete voucher');
		}
		deleteLoading = false;
		confirmOpen = false;
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	>
		<div
			class="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && onClose()}
			in:scale={{ start: 0.95, duration: 200, easing: quintOut }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
				<div>
					<h2 class="text-2xl font-bold tracking-tight text-secondary">
						{#if voucherId}
							Edit <span class="text-senary">Voucher</span>
						{:else}
							Create New <span class="text-senary">Voucher</span>
						{/if}
					</h2>
					<p class="text-xs font-light text-secondary/60 uppercase tracking-widest mt-1">
						{voucherId ? 'Update voucher details' : 'Add a new voucher or redeem code'}
					</p>
				</div>
				<button
					onclick={onClose}
					class="rounded-full p-2 text-secondary/50 transition-colors hover:bg-white/10 hover:text-white"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<div class="max-h-[75vh] overflow-y-auto px-8 py-8 no-scrollbar">
				{#if fetching}
					<div class="flex h-64 items-center justify-center">
						<Loader2 class="h-8 w-8 animate-spin text-senary" />
					</div>
				{:else}
					<form onsubmit={handleSubmit} class="space-y-6">
						<!-- Type Selection -->
						<div class="space-y-2">
							<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Voucher Type</Label>
							<div class="grid grid-cols-2 gap-4">
								<button
									type="button"
									class={cn(
										"group flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden",
										formData.type === 'voucher' 
											? "bg-senary/10 border-senary text-senary shadow-[0_0_30px_-10px_rgba(212,175,55,0.3)]" 
											: "bg-white/5 border-white/10 text-secondary/50 hover:bg-white/10 hover:border-white/20 hover:text-secondary hover:shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)]"
									)}
									onclick={() => formData.type = 'voucher'}
								>
									<div class={cn("p-3 rounded-full transition-all duration-300", formData.type === 'voucher' ? "bg-senary/20" : "bg-white/5 group-hover:bg-white/10")}>
										<Ticket class="h-6 w-6" />
									</div>
									<span class="font-bold text-sm tracking-wide">Standard Voucher</span>
									{#if formData.type === 'voucher'}
										<div class="absolute inset-0 bg-gradient-to-tr from-senary/10 via-transparent to-transparent"></div>
									{/if}
								</button>
								<button
									type="button"
									class={cn(
										"group flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden",
										formData.type === 'redeem_code' 
											? "bg-senary/10 border-senary text-senary shadow-[0_0_30px_-10px_rgba(212,175,55,0.3)]" 
											: "bg-white/5 border-white/10 text-secondary/50 hover:bg-white/10 hover:border-white/20 hover:text-secondary hover:shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)]"
									)}
									onclick={() => formData.type = 'redeem_code'}
								>
									<div class={cn("p-3 rounded-full transition-all duration-300", formData.type === 'redeem_code' ? "bg-senary/20" : "bg-white/5 group-hover:bg-white/10")}>
										<FileText class="h-6 w-6" />
									</div>
									<span class="font-bold text-sm tracking-wide">Redeem Code</span>
									{#if formData.type === 'redeem_code'}
										<div class="absolute inset-0 bg-gradient-to-tr from-senary/10 via-transparent to-transparent"></div>
									{/if}
								</button>
							</div>
						</div>

						<div class="grid gap-6 md:grid-cols-2">
							<!-- Title -->
							<div class="space-y-2 md:col-span-2">
								<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Title</Label>
								<Input 
									bind:value={formData.title} 
									placeholder="e.g. New Year Promo"
									class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
								/>
							</div>

							<!-- Code (Conditional) -->
							{#if formData.type === 'redeem_code'}
								<div class="space-y-2 md:col-span-2">
									<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Redeem Code</Label>
									<div class="relative group">
										<Input 
											bind:value={formData.code} 
											placeholder="e.g. PROMO2025"
											class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20 font-mono uppercase tracking-wider"
										/>
									</div>
								</div>
							{/if}

							<!-- Value -->
							<div class="space-y-2 md:col-span-2">
								<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Value (IDR)</Label>
								<div class="relative group">
									<Input 
										type="number"
										bind:value={formData.value} 
										placeholder="e.g. 50000"
										class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
									/>
								</div>
							</div>

							<!-- Dates -->
							<div class="space-y-2">
								<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Start Date</Label>
								<Popover.Root>
									<Popover.Trigger asChild>
										{#snippet child({ props })}
											<Button
												variant="outline"
												class={cn(
													"w-full justify-start text-left font-normal h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary hover:bg-white/10 hover:text-senary hover:border-senary/50",
													!startDateValue && "text-muted-foreground"
												)}
												{...props}
											>
												<CalendarIcon class="mr-2 h-4 w-4" />
												{startDateValue ? df.format(startDateValue.toDate(getLocalTimeZone())) : "Pick a date"}
											</Button>
										{/snippet}
									</Popover.Trigger>
									<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10 shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]">
										<Calendar bind:value={startDateValue} type="single" initialFocus class="text-secondary p-3" />
									</Popover.Content>
								</Popover.Root>
							</div>

							<div class="space-y-2">
								<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Expire Date</Label>
								<Popover.Root>
									<Popover.Trigger asChild>
										{#snippet child({ props })}
											<Button
												variant="outline"
												class={cn(
													"w-full justify-start text-left font-normal h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary hover:bg-white/10 hover:text-senary hover:border-senary/50",
													!expireDateValue && "text-muted-foreground"
												)}
												{...props}
											>
												<CalendarIcon class="mr-2 h-4 w-4" />
												{expireDateValue ? df.format(expireDateValue.toDate(getLocalTimeZone())) : "Pick a date"}
											</Button>
										{/snippet}
									</Popover.Trigger>
									<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10 shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]">
										<Calendar bind:value={expireDateValue} type="single" initialFocus class="text-secondary p-3" />
									</Popover.Content>
								</Popover.Root>
							</div>

							<!-- Description -->
							<div class="space-y-2 md:col-span-2">
								<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Description</Label>
								<Textarea 
									bind:value={formData.description} 
									placeholder="Enter voucher description..."
									class="min-h-[120px] rounded-xl border-white/10 bg-white/5 p-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20 resize-none"
								/>
							</div>
						</div>

						<div class="flex justify-between items-center pt-6 border-t border-white/10">
							{#if voucherId}
								<Button 
									type="button"
									variant="destructive" 
									onclick={initiateDelete}
									disabled={loading}
									class="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
								>
									<Trash2 class="mr-2 h-4 w-4" />
									Delete
								</Button>
							{:else}
								<div></div>
							{/if}

							<Button 
								type="button"
								variant="outline" 
								onclick={onClose}
								class="border-white/10 bg-white/5 text-secondary hover:bg-white/10 hover:text-white"
							>
								Cancel
							</Button>
						</div>
					</form>
				{/if}
			</div>

			<AdminConfirmDialog 
				bind:open={confirmOpen}
				title="Delete Voucher"
				description="Are you sure you want to delete this voucher? This action cannot be undone."
				confirmText="Delete"
				variant="destructive"
				loading={deleteLoading}
				onConfirm={confirmDelete}
			/>
		</div>
	</div>
{/if}