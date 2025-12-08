<script lang="ts">
	import { createOperationalTime, editOperationalTime, deleteOperationalTime, type OperationalTime } from '$lib/api/admin/operationalTime';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Loader2, Calendar as CalendarIcon, Clock, Trash2, X, Plus, Minus } from 'lucide-svelte';
	import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Input } from "$lib/components/ui/input";
	import AdminConfirmDialog from '$lib/components/ui/AdminConfirmDialog.svelte';

	let { operational = null, token, open = $bindable(false), onClose, onUpdate, initialDate = undefined } = $props<{
		operational?: OperationalTime | null;
		token: string;
		open: boolean;
		onClose: () => void;
		onUpdate: () => void;
		initialDate?: DateValue;
	}>();

	let loading = $state(false);
	
	let dateValue = $state<DateValue | undefined>(initialDate);
	let hours = $state<string[]>(['10:00']); // Default start time

	// Date handling
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	$effect(() => {
		if (open) {
			if (operational) {
				try {
					if (operational.date) dateValue = parseDate(operational.date.split('T')[0]);
					hours = [...operational.hour];
				} catch (e) {
					console.error('Parsing error', e);
				}
			} else {
				// If creating new, use initialDate if provided, otherwise today
				if (!dateValue && initialDate) {
					dateValue = initialDate;
				} else if (!dateValue) {
					dateValue = parseDate(new Date().toISOString().split('T')[0]);
				}
				hours = ['10:00'];
			}
		}
	});

	function addHour() {
		if (hours.length === 0) {
			hours = [...hours, '12:00'];
		} else {
			const lastTime = hours[hours.length - 1];
			const [hoursStr, minutesStr] = lastTime.split(':');
			let h = parseInt(hoursStr, 10);
			const m = minutesStr || '00';
			
			h = (h + 1) % 24;
			const nextTime = `${h.toString().padStart(2, '0')}:${m}`;
			
			hours = [...hours, nextTime];
		}
	}

	function removeHour(index: number) {
		hours = hours.filter((_, i) => i !== index);
	}

	function updateHour(index: number, value: string) {
		hours[index] = value;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!dateValue || hours.length === 0) {
			toast.error('Please select a date and at least one time slot');
			return;
		}

		// Validate hours format (HH:MM)
		const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
		for (const time of hours) {
			if (!timeRegex.test(time)) {
				toast.error(`Invalid time format: ${time}`);
				return;
			}
		}

		loading = true;
		const payload = {
			date: dateValue.toString(),
			hour: hours
		};

		let res;
		if (operational) {
			res = await editOperationalTime(fetch, operational.id, payload, token);
		} else {
			res = await createOperationalTime(fetch, payload, token);
		}
		
		if (res.success) {
			toast.success(`Schedule ${operational ? 'updated' : 'created'} successfully`);
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || `Failed to ${operational ? 'update' : 'create'} schedule`);
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
		if (!operational) return;
		
		deleteLoading = true;
		const res = await deleteOperationalTime(fetch, operational.id, token);
		
		if (res.success) {
			toast.success('Schedule deleted successfully');
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || 'Failed to delete schedule');
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
						{#if operational}
							Edit <span class="text-senary">Operational</span>
						{:else}
							Set <span class="text-senary">Operational</span>
						{/if}
					</h2>
					<p class="text-xs font-light text-secondary/60 uppercase tracking-widest mt-1">
						{operational ? 'Update daily availability' : 'Set availability for a specific date'}
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
				<form onsubmit={handleSubmit} class="space-y-6">
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

					<!-- Hours -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Available Hours</Label>
							<Button 
								type="button" 
								variant="ghost" 
								size="sm" 
								onclick={addHour}
								class="h-6 text-[10px] text-senary hover:text-senary hover:bg-senary/10"
							>
								<Plus class="mr-1 h-3 w-3" />
								Add Slot
							</Button>
						</div>
						
						<div class="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
							{#each hours as hour, i}
								<div class="flex items-center gap-2 group" transition:fade>
									<div class="relative flex-1">
										<Clock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/50" />
										<Input 
											type="time" 
											value={hour} 
											oninput={(e) => updateHour(i, e.currentTarget.value)}
											class="pl-9 h-10 rounded-lg border-white/10 bg-white/5 text-secondary focus:border-senary/50"
										/>
									</div>
									<Button 
										type="button" 
										variant="ghost" 
										size="icon"
										onclick={() => removeHour(i)}
										class="h-10 w-10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							{/each}
						{#if hours.length === 0}
                            <p class="text-xs text-red-400 mt-2 px-1">Please add at least one time slot.</p>
						{/if}
					</div>

					<div class="flex justify-between items-center pt-6 border-t border-white/10">
						{#if operational}
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

						<div class="flex gap-3">
							<Button 
								type="button"
								variant="outline" 
								onclick={onClose} 
								disabled={loading}
								class="border-white/10 bg-transparent text-secondary hover:bg-white/5 hover:text-white"
							>
								Cancel
							</Button>
							<Button 
								type="submit" 
								class="bg-senary text-primary hover:bg-senary/90 font-bold tracking-wide min-w-[120px]" 
								disabled={loading}
							>
								{#if loading}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								{operational ? 'Save Changes' : 'Create'}
							</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>

	<AdminConfirmDialog 
		bind:open={confirmOpen}
		title="Delete Schedule"
		description="Are you sure you want to delete this schedule? This action cannot be undone."
		variant="destructive"
		confirmText="Delete"
		loading={deleteLoading}
		onConfirm={confirmDelete}
	/>
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 2px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
