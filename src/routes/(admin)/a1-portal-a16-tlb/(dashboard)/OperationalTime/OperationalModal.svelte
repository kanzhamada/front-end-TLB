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
					// Normalize hours to HH:MM (remove seconds if present)
					hours = operational.hour ? operational.hour.map((h: string) => h.substring(0, 5)) : [];
				} catch (e) {
					console.error('Parsing error', e);
				}
			} else {
				// If creating new, use initialDate if provided, otherwise today
				if (initialDate) {
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
		// Date required, but hours can be empty (meaning closed/no slots)
		if (!dateValue) {
			toast.error('Please select a date');
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

	async function handleDelete() {
		if (!operational) return;
		if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) return;

		loading = true;
		const res = await deleteOperationalTime(fetch, operational.id, token);
		
		if (res.success) {
			toast.success('Schedule deleted successfully');
			onUpdate();
			onClose();
		} else {
			toast.error(res.message || 'Failed to delete schedule');
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
						{#if operational}
							Edit <span class="text-senary">Schedule</span>
						{:else}
							Set <span class="text-senary">Override</span>
						{/if}
					</h2>
					<p class="text-xs font-light text-secondary/60 uppercase tracking-widest mt-1">
						{operational ? 'Modify existing daily hours' : 'Define hours for this specific date'}
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
					<!-- Date Display (Active Date) -->
					<div class="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-senary/10 text-senary border border-senary/20">
							<CalendarIcon class="h-6 w-6" />
						</div>
						<div>
							<Label class="text-[10px] font-bold tracking-widest text-secondary/50 uppercase block mb-0.5">Selected Date</Label>
							<p class="text-lg font-bold text-white tracking-tight">
								{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : "No Date Selected"}
							</p>
						</div>
					</div>

					<!-- Time Slots (Chip Layout) -->
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<Label class="text-xs font-bold tracking-widest text-secondary/70 uppercase">Available Time Slots</Label>
							<span class="text-[10px] text-secondary/40">{hours.length} Active Slots</span>
						</div>
						
						<div class="min-h-[120px] p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-wrap gap-2 content-start">
							{#each hours as hour, i}
								<div class="relative group/chip flex items-center bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg pr-1 pl-1 py-1 transition-all" transition:scale>
									<Input 
										type="time" 
										value={hour} 
										oninput={(e) => updateHour(i, e.currentTarget.value)}
										class="time-input h-7 p-1 text-sm font-bold font-mono text-white border-none bg-transparent focus-visible:ring-0 text-center w-24 cursor-pointer"
									/>
									<button 
										type="button"
										onclick={() => removeHour(i)}
										class="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full opacity-0 group-hover/chip:opacity-100 shadow-lg flex items-center justify-center hover:bg-red-600 transition-all scale-75 hover:scale-100 z-10 ring-2 ring-black"
									>
										<X class="h-3 w-3" />
									</button>
								</div>
							{/each}
							{#if hours.length === 0}
								<div class="text-center py-4 text-xs text-secondary/40 border border-dashed border-white/10 rounded-lg">
									No time slots added
								</div>
							{/if}
						</div>
					</div>

					<!-- Actions -->
					<div class="flex justify-between items-center pt-2">
						{#if operational}
							<Button 
								type="button"
								variant="destructive" 
								onclick={handleDelete}
								disabled={loading}
								class="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 h-11 px-6"
							>
								<Trash2 class="mr-2 h-4 w-4" />
								Delete Override
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
								{operational ? 'Save Changes' : 'Create Schedule'}
							</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}


