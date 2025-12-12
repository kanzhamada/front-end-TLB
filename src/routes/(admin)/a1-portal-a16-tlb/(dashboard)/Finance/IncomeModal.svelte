<script lang="ts">
	import { createOfflineIncome, updateOfflineIncome, deleteOfflineIncome, type OfflineIncome } from '$lib/api/admin/finance';
	import { getServices, type Service } from '$lib/api/admin/service';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Loader2, Calendar as CalendarIcon, Wallet, CreditCard, Trash2, X, Check } from 'lucide-svelte';
	import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let { income = null, token, open = $bindable(false), onClose, onUpdate } = $props<{
		income?: OfflineIncome | null;
		token: string;
		open: boolean;
		onClose: () => void;
		onUpdate: () => void;
	}>();

	let loading = $state(false);
	let services = $state<Service[]>([]);
	
	let formData = $state({
		date: '',
		type: 'Tunai',
		serviceId: ''
	});

	// Date handling
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	let dateValue = $state<DateValue | undefined>(undefined);

	$effect(() => {
		if (dateValue) {
			formData.date = dateValue.toString();
		}
	});

	$effect(() => {
		if (open) {
			loadServices();
			if (income) {
				formData = {
					date: income.date,
					type: income.type,
					serviceId: income.service.id
				};
				try {
					if (income.date) dateValue = parseDate(income.date.split('T')[0]);
				} catch (e) {
					console.error('Date parsing error', e);
				}
			} else {
				resetForm();
			}
		}
	});

	function resetForm() {
		formData = {
			date: new Date().toISOString().split('T')[0],
			type: 'Tunai',
			serviceId: ''
		};
		dateValue = parseDate(new Date().toISOString().split('T')[0]);
	}

	async function loadServices() {
		const res = await getServices(fetch);
		if (res.success && res.data) {
			services = res.data;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!formData.date || !formData.type || !formData.serviceId) {
			toast.error('Please fill in all required fields');
			return;
		}

		loading = true;
		let res;
		if (income) {
			res = await updateOfflineIncome(fetch, income.id, formData, token);
		} else {
			res = await createOfflineIncome(fetch, formData, token);
		}
		
		if (res.success) {
			toast.success(`Income ${income ? 'updated' : 'recorded'} successfully`);
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || `Failed to ${income ? 'update' : 'record'} income`);
		}
		loading = false;
	}

	async function handleDelete() {
		if (!income) return;
		if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;

		loading = true;
		const res = await deleteOfflineIncome(fetch, income.id, token);
		
		if (res.success) {
			toast.success('Record deleted successfully');
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || 'Failed to delete record');
		}
		loading = false;
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
			class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl"
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
						{#if income}
							Edit <span class="text-senary">Income</span>
						{:else}
							Record <span class="text-senary">Income</span>
						{/if}
					</h2>
					<p class="text-xs font-light text-secondary/60 uppercase tracking-widest mt-1">
						{income ? 'Update income details' : 'Add a new offline income record'}
					</p>
				</div>
				<button
					onclick={onClose}
					class="rounded-full p-2 text-secondary/50 transition-colors hover:bg-white/10 hover:text-white"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<div class="p-8">
				<form onsubmit={handleSubmit} class="space-y-8">
					<!-- Type Selection -->
					<div class="space-y-4">
						<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Payment Type</Label>
						<div class="grid grid-cols-2 gap-4">
							<button
								type="button"
								class={cn(
									"group flex flex-col items-center justify-center gap-3 rounded-2xl border p-4 transition-all duration-300 relative overflow-hidden",
									formData.type === 'Tunai' 
										? "bg-senary/10 border-senary text-senary shadow-[0_0_30px_-10px_rgba(212,175,55,0.3)]" 
										: "bg-white/5 border-white/10 text-secondary/50 hover:bg-white/10 hover:border-white/20 hover:text-secondary hover:shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)]"
								)}
								onclick={() => formData.type = 'Tunai'}
							>
								<div class={cn("p-2 rounded-full transition-all duration-300", formData.type === 'Tunai' ? "bg-senary/20" : "bg-white/5 group-hover:bg-white/10")}>
									<Wallet class="h-5 w-5" />
								</div>
								<span class="font-bold text-sm tracking-wide">Cash (Tunai)</span>
							</button>
							<button
								type="button"
								class={cn(
									"group flex flex-col items-center justify-center gap-3 rounded-2xl border p-4 transition-all duration-300 relative overflow-hidden",
									formData.type === 'QRIS' 
										? "bg-senary/10 border-senary text-senary shadow-[0_0_30px_-10px_rgba(212,175,55,0.3)]" 
										: "bg-white/5 border-white/10 text-secondary/50 hover:bg-white/10 hover:border-white/20 hover:text-secondary hover:shadow-[0_0_20px_-10px_rgba(255,255,255,0.1)]"
								)}
								onclick={() => formData.type = 'QRIS'}
							>
								<div class={cn("p-2 rounded-full transition-all duration-300", formData.type === 'QRIS' ? "bg-senary/20" : "bg-white/5 group-hover:bg-white/10")}>
									<CreditCard class="h-5 w-5" />
								</div>
								<span class="font-bold text-sm tracking-wide">QRIS</span>
							</button>
						</div>
					</div>

					<!-- Date -->
					<div class="space-y-2">
						<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Date</Label>
						<Popover.Root>
							<Popover.Trigger asChild>
								{#snippet child({ props })}
									<Button
										variant="outline"
										class={cn(
											"w-full justify-start text-left font-normal h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary hover:bg-white/10 hover:text-senary hover:border-senary/50",
											!dateValue && "text-muted-foreground"
										)}
										{...props}
									>
										<CalendarIcon class="mr-2 h-4 w-4" />
										{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : "Pick a date"}
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0 bg-slate-950 border-white/10 shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]">
								<Calendar bind:value={dateValue} type="single" initialFocus class="text-secondary p-3" />
							</Popover.Content>
						</Popover.Root>
					</div>

					<!-- Service -->
					<div class="space-y-2">
						<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Service</Label>
						<Select.Root type="single" bind:value={formData.serviceId}>
							<Select.Trigger class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary hover:bg-white/10 hover:border-senary/50 focus:ring-senary/20">
								{services.find(s => s.id === formData.serviceId)?.name || "Select a service"}
							</Select.Trigger>
							<Select.Content class="bg-slate-950 border-white/10 text-secondary max-h-[200px] overflow-y-auto">
								{#each services as service}
									<Select.Item value={service.id} label={service.name} class="focus:bg-white/10 focus:text-senary cursor-pointer">
										{service.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(service.price)})
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Actions -->
					<div class="flex justify-between items-center pt-2">
						{#if income}
							<Button 
								type="button"
								variant="destructive" 
								onclick={handleDelete}
								disabled={loading}
								class="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 h-11 px-6"
							>
								<Trash2 class="mr-2 h-4 w-4" />
								Delete
							</Button>
						{:else}
							<div></div>
						{/if}

						<div class="flex gap-3">
							<Button 
								type="button"
								variant="outline" 
								onclick={onClose} 
								disabled={loading}
								class="border-white/10 bg-transparent text-secondary hover:bg-white/5 hover:text-white h-11 px-6 rounded-xl"
							>
								Cancel
							</Button>
							<Button 
								type="submit" 
								class="bg-senary text-primary hover:bg-senary/90 font-bold tracking-wide min-w-[140px] h-11 rounded-xl shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)]" 
								disabled={loading}
							>
								{#if loading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								{income ? 'Save Changes' : 'Record'}
							</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
