<script lang="ts">
	import { createExpense, updateExpense, deleteExpense, type Expense } from '$lib/api/admin/finance';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Loader2, Calendar as CalendarIcon, Trash2, X } from 'lucide-svelte';
	import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import AdminConfirmDialog from '$lib/components/ui/AdminConfirmDialog.svelte';
	import * as Select from '$lib/components/ui/select';

	let { expense = null, token, open = $bindable(false), onClose, onUpdate } = $props<{
		expense?: Expense | null;
		token: string;
		open: boolean;
		onClose?: () => void;
		onUpdate: () => void;
	}>();

	$effect(() => {
		console.log('ExpenseModal Token:', token);
	});

	let loading = $state(false);
	
	let formData = $state<{
		date: string;
		description: string;
		nominal: number | null;
		category: string;
	}>({
		date: '',
		description: '',
		nominal: null,
		category: 'General'
	});

	// ...

	function resetForm() {
		formData = {
			date: new Date().toISOString().split('T')[0],
			description: '',
			nominal: null,
			category: 'General'
		};
		dateValue = parseDate(new Date().toISOString().split('T')[0]);
	}

    // ... Note: The actual replacement needs to cover the definition and resetForm.
    // However, replace_file_content works on contiguous blocks.
    // I will split this into two edits if needed, but here I effectively need to change the state definition first.
    // Wait, the tool requires contiguous block. `resetForm` is lines 73-81. State is 33-38. They are far apart.
    // I will use multi_replace.
    // Wait, I only have replace_file_content available in this turn? No, I have multi_replace_file_content.
    // Let me check my tools. I see `multi_replace_file_content` in the definitions.
    // I will use `replace_file_content` for the state definition first, then `resetForm`, then the input.
    // Actually, I can just do three sequential `replace_file_content` calls or one `multi_replace_file_content`.
    // I'll try `multi_replace_file_content` for efficiency.


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
			if (expense) {
				formData = {
					date: expense.date,
					description: expense.description,
					nominal: expense.nominal,
					category: expense.category || 'General' // Default to General if missing
				};
				try {
					if (expense.date) dateValue = parseDate(expense.date.split('T')[0]);
				} catch (e) {
					console.error('Date parsing error', e);
				}
			} else {
				resetForm();
			}
		}
	});



	function handleClose() {
		if (onClose) onClose();
		else open = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!formData.date || !formData.description || !formData.nominal) {
			toast.error('Please fill in all required fields');
			return;
		}

		loading = true;
		let res;
		if (expense) {
			res = await updateExpense(fetch, expense.id, formData, token);
		} else {
			res = await createExpense(fetch, formData, token);
		}
		
		if (res.success) {
			toast.success(`Expense ${expense ? 'updated' : 'recorded'} successfully`);
			onUpdate();
			handleClose();
		} else {
			toast.error(res.message || `Failed to ${expense ? 'update' : 'record'} expense`);
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
		if (!expense) return;
		
		deleteLoading = true;
		const res = await deleteExpense(fetch, expense.id, token);
		
		if (res.success) {
			toast.success('Record deleted successfully');
			onUpdate();
			handleClose();
		} else {
			toast.error(res.message || 'Failed to delete record');
		}
		deleteLoading = false;
		confirmOpen = false;
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
		onclick={handleClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
	>
		<div
			class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="document"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
			in:scale={{ start: 0.95, duration: 200, easing: quintOut }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
				<div>
					<h2 class="text-2xl font-bold tracking-tight text-secondary">
						{#if expense}
							Edit <span class="text-senary">Expense</span>
						{:else}
							Record <span class="text-senary">Expense</span>
						{/if}
					</h2>
					<p class="text-xs font-light text-secondary/60 uppercase tracking-widest mt-1">
						{expense ? 'Update expense details' : 'Add a new expense record'}
					</p>
				</div>
				<button
					onclick={handleClose}
					class="rounded-full p-2 text-secondary/50 transition-colors hover:bg-white/10 hover:text-white"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<div class="p-8">
				<form onsubmit={handleSubmit} class="space-y-8">
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

					<!-- Category -->
					<div class="space-y-2">
						<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Category</Label>
						<Select.Root type="single" bind:value={formData.category}>
							<Select.Trigger class="w-full h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary hover:bg-white/10 hover:text-white transition-colors flex items-center justify-between">
								{formData.category}
							</Select.Trigger>
							<Select.Content class="bg-slate-950 border-white/10 text-secondary shadow-2xl">
								{#each ['Payroll & Staffing', 'Consumables / Supplies', 'Maintenance & Repairs', 'Marketing & Promotion', 'Utilities', 'General', 'Other'] as category}
									<Select.Item value={category} label={category} class="hover:bg-white/5 cursor-pointer data-[highlighted]:bg-white/5 data-[highlighted]:text-white my-1 rounded-lg">
										{category}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Description -->
					<div class="space-y-2">
						<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Description</Label>
						<Textarea 
							bind:value={formData.description} 
							placeholder="e.g. Electricity Bill"
							class="min-h-[100px] rounded-xl border-white/10 bg-white/5 p-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20 resize-none"
						/>
					</div>

					<!-- Nominal -->
					<div class="space-y-2">
						<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Nominal (IDR)</Label>
						<div class="relative group">
							<Input 
								type="number"
								bind:value={formData.nominal} 
								placeholder="e.g. 500000"
								class="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-secondary placeholder:text-secondary/30 focus:border-senary/50 focus:ring-senary/20"
							/>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex justify-between items-center pt-2">
						{#if expense}
							<Button 
								type="button" 
								variant="destructive" 
								class="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 h-11 px-6"
								onclick={initiateDelete}
								disabled={loading}
							>
								{#if loading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{:else}
									<Trash2 class="mr-2 h-4 w-4" />
								{/if}
								Delete
							</Button>
						{:else}
							<div></div>
						{/if}

						<div class="flex gap-3">
							<Button 
								type="button"
								variant="outline" 
								onclick={handleClose} 
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
								{expense ? 'Save Changes' : 'Record'}
							</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	<AdminConfirmDialog 
		bind:open={confirmOpen}
		title="Delete Expense Record"
		description="Are you sure you want to delete this expense record? This action cannot be undone."
		variant="destructive"
		confirmText="Delete"
		loading={deleteLoading}
		onConfirm={confirmDelete}
	/>
	</div>
{/if}
<style>
	:global(.bg-black\/80) {
		background-color: rgba(2, 6, 23, 0.8); /* Slate-950 */
	}
	:global(.backdrop-blur-md) {
		backdrop-filter: blur(12px);
	}
</style>
